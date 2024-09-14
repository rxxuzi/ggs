package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"
)

type Event struct {
	ID               string `json:"id"`
	EventName        string `json:"eventName"`
	ShortDescription string `json:"shortDescription"`
	Description      string `json:"description"`
	Platform         string `json:"platform"`
	Deadline         string `json:"deadline"`
	Conditions       string `json:"conditions"`
	CommunityLink    string `json:"communityLink"`
	Author           string `json:"author"`
}

var (
	events    []Event
	eventsMux sync.Mutex
	filePath  = "events.json"
)

func main() {
	loadEvents()

	http.HandleFunc("/events", eventsHandler)

	port := ":1129"
	fmt.Printf("Server is starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

func loadEvents() {
	file, err := ioutil.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			log.Println("Events file not found. Starting with an empty list.")
			return
		}
		log.Fatal(err)
	}

	err = json.Unmarshal(file, &events)
	if err != nil {
		log.Fatal(err)
	}
}

func saveEvents() {
	file, err := json.MarshalIndent(events, "", "  ")
	if err != nil {
		log.Fatal(err)
	}

	err = ioutil.WriteFile(filePath, file, 0644)
	if err != nil {
		log.Fatal(err)
	}
}

func eventsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case "GET":
		json.NewEncoder(w).Encode(events)
	case "POST":
		var newEvent Event
		err := json.NewDecoder(r.Body).Decode(&newEvent)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		eventsMux.Lock()
		events = append(events, newEvent)
		saveEvents()
		eventsMux.Unlock()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newEvent)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
