package main

import (
	"encoding/json"
	"fmt"
	"net"
)

type User struct {
	Type  int    `json:"type"`
	Token string `json:"token"`
}

func connection(conn net.Conn) {
	// try to read
	for {
		packet := make([]byte, 1024)
		_, err := conn.Read(packet)
		if err != nil {
			continue
		}
		fmt.Println("Read: ", string(packet))
	}
}

func main() {
	userMap := make(map[string]net.Conn)
	socket, err := net.Listen("tcp", ":8080")
	if err != nil {
		fmt.Println("Fail to open socket: ", err)
	}
	defer func(socket net.Listener) {
		err := socket.Close()
		if err != nil {
			fmt.Println("Fail to close socket: ", err)
		}
	}(socket)

	for {
		conn, err := socket.Accept()
		if err != nil {
			fmt.Println("Fail to accept client: ", err)
			continue
		}

		buf := make([]byte, 1024)
		n, err := conn.Read(buf)
		if err != nil {
			fmt.Println("Fail to read from client: ", err)
			continue
		}

		jsonFile := User{}
		err = json.Unmarshal(buf[:n], &jsonFile)
		if err != nil {
			fmt.Println("Fail to parse json: ", err)
			continue
		}

		// if type is 1, then register
		if jsonFile.Type == 1 {
			fmt.Println("Register: ", jsonFile.Token)
			userMap[jsonFile.Token] = conn
		} else if jsonFile.Type == 2 {
			fmt.Println("Connect: ", jsonFile.Token)
			existingConn, ok := userMap[jsonFile.Token]
			if ok {
				write, err := existingConn.Write([]byte("1"))
				if err != nil {
					continue
				}
				fmt.Println("Write: ", write)
			} else {
				write, err := conn.Write([]byte("Connection refused"))
				if err != nil {
					continue
				}
				fmt.Println("Write: ", write)
			}
		}

		go connection(conn)
	}
}
