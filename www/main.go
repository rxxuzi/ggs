package main

import (
	"fmt"
	"net/http"
)

func main() {
	// 静的ファイルのディレクトリを指定（例: ./static）
	fileServer := http.FileServer(http.Dir("./"))

	// ルートパスにファイルサーバーを割り当てる
	http.Handle("/", fileServer)

	port := ":5151"
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("サーバーエラー: %v\n", err)
	}
}
