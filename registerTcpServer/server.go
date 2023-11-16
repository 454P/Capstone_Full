package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net"
	"strings"
)

type User struct {
	Type int    `json:"type"`
	Api  string `json:"api"`
}

func connection(conn net.Conn, channel chan []byte) {
	// try to read
	for {
		var dataBuff []byte
		var readComplete bool
		for {
			tmpBuff := make([]byte, 1024)
			n, err := conn.Read(tmpBuff)
			if err != nil {
				fmt.Println("conn.Read() returned", err.Error())
				if err == io.EOF {
					fmt.Println("Client closed connection")
					conn.Close()
					return
				} else {
					continue
				}
			}
			// if packet is "0000000000", then break
			if strings.HasSuffix(strings.TrimSpace(strings.Trim(string(tmpBuff), "\x00")), "0000000000") {
				readComplete = true
				tmpBuff = []byte(strings.TrimSuffix(strings.TrimSpace(strings.Trim(string(tmpBuff), "\x00")), "0000000000"))
				n = len(tmpBuff)
			}
			dataBuff = append(dataBuff, tmpBuff[:n]...)
			if readComplete {
				break
			}
		}
		packet := dataBuff
		fmt.Println("Read: packet from client, size: ", len(packet))
		channel <- packet
	}
}

func modelServer(conn net.Conn, channel chan []byte) {
	// if channel has data, then send to client
	for {
		data := <-channel
		fmt.Println("Write: ", string(data))
		_, err := conn.Write(data)
		if err != nil {
			fmt.Println("Fail to write: ", err)
			continue
		}
		_, err = conn.Write([]byte("0000000000"))
		if err != nil {
			fmt.Println("Fail to write: ", err)
			continue
		}
		fmt.Println("sent to db")

		//recv word
		var dataBuff []byte
		var readComplete bool
		for {
			tmpBuff := make([]byte, 1024)
			n, err := conn.Read(tmpBuff)
			if err != nil {
				fmt.Println("conn.Read() returned", err.Error())
				if err == io.EOF {
					fmt.Println("Client closed connection")
					conn.Close()
					return
				} else {
					continue
				}
			}

			fmt.Println("Read", n, "bytes: ", string(tmpBuff))
			// if packet is "0000000000", then break
			if strings.HasSuffix(strings.TrimSpace(strings.Trim(string(tmpBuff), "\x00")), "0000000000") {
				readComplete = true
				tmpBuff = []byte(strings.TrimSuffix(strings.TrimSpace(strings.Trim(string(tmpBuff), "\x00")), "0000000000"))
				n = len(tmpBuff)
			}
			dataBuff = append(dataBuff, tmpBuff[:n]...)
			if readComplete {
				break
			}
		}
		packet := dataBuff
		fmt.Println("Read from model server: ", string(packet))
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

	channel := make(chan []byte)
	for {
		conn, err := socket.Accept()
		if err != nil {
			fmt.Println("Fail to accept client: ", err)
			continue
		}
		fmt.Println("Accept: ", conn.RemoteAddr())
		// read packet until "0000000000"
		var dataBuff []byte
		var readComplete bool
		for {
			tmpBuff := make([]byte, 1024)
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
			if strings.TrimSpace(strings.Trim(string(tmpBuff), "\x00")) == "0000000000" {
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
			fmt.Println("Register: ", jsonFile.Api)
			userMap[jsonFile.Api] = conn
			go connection(conn, channel)
		} else if jsonFile.Type == 2 {
			fmt.Println("Connect: ", jsonFile.Api)
			existingConn, ok := userMap[jsonFile.Api]
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
		} else if jsonFile.Type == 3 {
			fmt.Println("Model connected")
			go modelServer(conn, channel)
		}
	}
}
