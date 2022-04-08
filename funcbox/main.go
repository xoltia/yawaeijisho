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

var upgrader = websocket.Upgrader{
	// TODO: More precise sizes
	ReadBufferSize:  4096,
	WriteBufferSize: 1024,
}

func main() {
	flag.Parse()
	log.SetFlags(0)

	initializeVMs(*isoCount)

	// Http endpoints
	// TODO

	// Webscoekt endpoints
	http.HandleFunc("/ws", serveWs)
	http.HandleFunc("/socket", serveWs)

	log.Fatal(http.ListenAndServe(*addr, nil))
}
