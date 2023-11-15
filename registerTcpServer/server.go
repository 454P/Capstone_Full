package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net"
)

type User struct {
	Type  int    `json:"type"`
	Token string `json:"token"`
}

func connection(conn net.Conn) {
	// try to read
	for {
		tmpBuff := make([]byte, 1024)
		var dataBuff []byte
		var readComplete bool
		for {
			n, err := conn.Read(tmpBuff)
			if err != nil {
				fmt.Println("conn.Read() returned", err.Error())
				if err == io.EOF {
					fmt.Println("Connection closed from client side: ", conn.RemoteAddr())
					_ = conn.Close()
					return

				} else {
					continue
				}
			}

			fmt.Println("Read", n, "bytes")
			// if packet is "0000000000", then break
			if n == 10 && string(tmpBuff) == "0000000000" {
				break
			}
			dataBuff = append(dataBuff, tmpBuff[:n]...)

			if readComplete {
				break
			}
		}
		packet := dataBuff
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
		fmt.Println("Accept: ", conn.RemoteAddr())
		// read packet until "0000000000"
		tmpBuff := make([]byte, 1024)
		var dataBuff []byte
		var readComplete bool
		for {
			n, err := conn.Read(tmpBuff)
			if err != nil {
				fmt.Println("conn.Read() returned", err.Error())
				if err == io.EOF {
					continue
				} else {
					continue
				}
			}

			fmt.Println("Read", n, "bytes: ", string(tmpBuff))
			// if packet is "0000000000", then break
			if n == 10 && string(tmpBuff) == "0000000000" {
				break
			}
			dataBuff = append(dataBuff, tmpBuff[:n]...)

			if readComplete {
				break
			}
		}
		// unmarshal json
		jsonFile := User{}
		err = json.Unmarshal(dataBuff, &jsonFile)
		if err != nil {
			fmt.Println("Fail to unmarshal json: ", err)
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
