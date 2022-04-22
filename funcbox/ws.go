package main

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type PromptEventMessage struct {
	Event string `json:"event"`
	PromptMessage
}

type ResultEventMessage struct {
	Event  string      `json:"event"`
	Result interface{} `json:"result"`
}

type ErrorEventMessage struct {
	Event string `json:"event"`
	ErrorMessage
}

func createResultEventMessage(jsonBytes []byte) ResultEventMessage {
	var data interface{}
	json.Unmarshal(jsonBytes, &data)
	return ResultEventMessage{"Result", data}
}

func createPromptEventMessage(prompt *PromptMessage) PromptEventMessage {
	return PromptEventMessage{"Prompt", *prompt}
}

func processCallMessage(c *websocket.Conn, execTimeout int64, inputTimeout int64) {
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

	// Get channels for communicating with executor
	resultChan, promptChan, inputChan := executeCallMessage(&initalMessage, time.Duration(execTimeout)*time.Second)

	// Answer any prompts until executor closes the channel
	for prompt := range promptChan {
		// Send prompts down the socket
		c.WriteJSON(createPromptEventMessage(&prompt))
		// Read response to prompt, again checking for errors
		c.SetReadDeadline(time.Now().Add(time.Duration(inputTimeout) * time.Second))
		messageType, message, err := c.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("unexpected close error: %v", err)
			}

			e, ok := err.(net.Error)
			if ok && e.Timeout() {
				c.WriteJSON(createError(InputTimeout))
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

	result := <-resultChan

	if !result.success {
		c.WriteJSON(createError(result.errorCode))
	} else {
		c.WriteJSON(createResultEventMessage(result.jsonReturn))
	}
}

func createServeFunction(execTimeout, inputTimeout int64) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		upgrader.CheckOrigin = func(_ *http.Request) bool { return true }

		// Upgrade connection
		c, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Print("upgrade error:", err)
			return
		}

		// Start listening to messages
		go processCallMessage(c, execTimeout, inputTimeout)
	}
}
