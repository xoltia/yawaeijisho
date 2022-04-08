package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

func processCallMessage(c *websocket.Conn) {
	defer c.Close()

	// First message should contain a CallMessage
	var initalMessage CallMessage
	err := c.ReadJSON(&initalMessage)

	// Check if error reading message
	if err != nil {
		if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
			log.Printf("unexpected close error: %v", err)
		}
		return
	}

	fmt.Printf("READ MESSAGE, NO ERROR:\n%#v\n", initalMessage)

	// Get channels for communicating with executor
	resultChan, promptChan, inputChan := executeCallMessage(&initalMessage, 10*time.Second)

	fmt.Println("CALLED EXECUTE")

	// Answer any prompts until executor closes the channel
	for prompt := range promptChan {
		// Send prompts down the socket
		c.WriteJSON(prompt)
		// Read response to prompt, again checking for errors
		messageType, message, err := c.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("unexpected close error: %v", err)
			}

			// IMPORTANT!
			// If the input channel is not closed then the script will get stuck on input
			close(inputChan)
			return
		}

		if messageType != websocket.TextMessage {
			c.WriteJSON(createError(UnexpectedMessageType).withMessage("Expected text message type."))
			close(inputChan)
			return
		}

		// Send the response from the socket to the executor
		inputChan <- string(message)
	}

	close(inputChan)

	fmt.Println("PASSED PROMPT")

	result := <-resultChan
	fmt.Printf("%t\n", result.success)
	if !result.success {
		c.WriteJSON(createError(result.errorCode))
	} else {
		c.WriteMessage(websocket.TextMessage, result.jsonReturn)
	}
}

func serveWs(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(_ *http.Request) bool { return true }

	// Upgrade connection
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade error:", err)
		return
	}

	// Start listening to messages
	go processCallMessage(c)
}
