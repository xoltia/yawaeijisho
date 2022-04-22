package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// Address for HTTP server
var addr = flag.String("addr", "localhost:3090", "http service address")

// Number of isolates to use
var isoCount = flag.Int("numiso", 100, "number of isolates to create")

// Number of isolates to use
var inputTime = flag.Int64("intime", 20, "how long a connection is willing to listen for intput messages before timeout (in seconds)")

// Number of isolates to use
var executionTime = flag.Int64("exectime", 60, "how long a script has to execute before timeout (in seconds)")

var upgrader = websocket.Upgrader{
	// TODO: More precise sizes
	ReadBufferSize:  4096,
	WriteBufferSize: 1024,
}

func checkAlive(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("I am alive!"))
}

func main() {
	flag.Parse()
	log.SetFlags(0)

	initializeVMs(*isoCount)

	// Http endpoints
	http.HandleFunc("/check_alive", checkAlive)

	serveWs := createServeFunction(*executionTime, *inputTime)

	// Webscoekt endpoints
	http.HandleFunc("/ws", serveWs)
	http.HandleFunc("/socket", serveWs)

	log.Fatal(http.ListenAndServe(*addr, nil))
}
