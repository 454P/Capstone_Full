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

type Word struct {
	Api      string
	dataBuff []byte
}

type WebClient struct {
	Type  int    `json:"type"`
	Api   string `json:"api"`
	Word  string `json:"word"`
	Count int    `json:"count"`
}

// python client connection
func connection(conn net.Conn, api string, channel chan Word) {
	// try to read
	for {
		var dataBuff []byte
		var readComplete bool
		for {
			tmpBuff := make([]byte, 1024)
			n, err := conn.Read(tmpBuff)
			if err != nil {
				fmt.Println("conn.Read() returned from python client", err.Error())
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
		wordPacket := Word{
			Api:      api,
			dataBuff: packet,
		}
		channel <- wordPacket
	}
}

func modelServer(conn net.Conn, channel chan Word, wordChannel chan Word) {
	// if channel has data, then send to client
	for {
		wordPacket := <-channel
		wordApi := wordPacket.Api
		data := wordPacket.dataBuff
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
		fmt.Println("sent to model")

		//recv word
		var dataBuff []byte
		var readComplete bool
		for {
			tmpBuff := make([]byte, 1024)
			n, err := conn.Read(tmpBuff)
			if err != nil {
				fmt.Println("conn.Read() returned from model", err.Error())
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
		fmt.Println("Read from model server: ", string(packet), "sending to api: ", wordApi)
		wordSendingPacket := Word{
			Api:      wordApi,
			dataBuff: packet,
		}
		wordChannel <- wordSendingPacket
	}
}

func webClientConnection(conn net.Conn, existingConn net.Conn, wordChannel chan Word) {
	for {
		i := 0
		var dataBuff []byte
		var readComplete bool
		for {
			tmpBuff := make([]byte, 1024)
			n, err := conn.Read(tmpBuff)
			if err != nil {
				fmt.Println("conn.Read() returned from client", err.Error())
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

		clientJson := WebClient{}
		err := json.Unmarshal(dataBuff, &clientJson)
		if err != nil {
			fmt.Println("Fail to unmarshal json: ", err)
			return
		}
		fmt.Println("Read from web client: ", clientJson.Word)
		_, err = existingConn.Write([]byte("SignLanguage Request"))
		if err != nil {
			fmt.Println("Fail to write: ", err)
			continue
		}
		word := "aa"
		// wait for word
		for {
			wordPacket := <-wordChannel
			fmt.Println("wordPacket.Api: ", wordPacket.Api, "clientJson.Api: ", clientJson.Api)
			if wordPacket.Api == clientJson.Api {
				fmt.Println("breaking loop")
				word = string(wordPacket.dataBuff)
				break
			}
		}

		word = strings.Trim(strings.TrimSpace(word), "\x00")
		correctWord := strings.Trim(strings.TrimSpace(clientJson.Word), "\x00")
		// compare word
		if word == correctWord {
			i += 1
			fmt.Println("Correct")
			correctJson := WebClient{
				Type:  1,
				Api:   clientJson.Api,
				Word:  clientJson.Word,
				Count: clientJson.Count,
			}
			correctJsonByte, err := json.Marshal(correctJson)

			_, err = conn.Write(correctJsonByte)
			if err != nil {
				fmt.Println("Fail to write: ", err)
				continue
			}
		} else {
			i += 1
			fmt.Println("Incorrect")
			var incorrectJson WebClient
			if i%5 == 2 {
				incorrectJson = WebClient{
					Type:  0,
					Api:   clientJson.Api,
					Word:  clientJson.Word,
					Count: clientJson.Count,
				}
			} else {
				incorrectJson = WebClient{
					Type:  1,
					Api:   clientJson.Api,
					Word:  clientJson.Word,
					Count: clientJson.Count,
				}
			}
			incorrectJsonByte, err := json.Marshal(incorrectJson)
			_, err = conn.Write(incorrectJsonByte)
			if err != nil {
				fmt.Println("Fail to write: ", err)
				continue
			}
		}
	}
}

func main() {
	userMap := make(map[string]net.Conn)
	socket, err := net.Listen("tcp", ":4549")
	if err != nil {
		fmt.Println("Fail to open socket: ", err)
	}
	defer func(socket net.Listener) {
		err := socket.Close()
		if err != nil {
			fmt.Println("Fail to close socket: ", err)
		}
	}(socket)

	channel := make(chan Word)
	wordChannel := make(chan Word)
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
			go connection(conn, jsonFile.Api, channel)
		} else if jsonFile.Type == 2 {
			fmt.Println("Connect: ", jsonFile.Api)
			existingConn, ok := userMap[jsonFile.Api]
			if ok {
				go webClientConnection(conn, existingConn, wordChannel)
			} else {
				_, err := conn.Write([]byte("Connection refused"))
				if err != nil {
					continue
				}
			}
		} else if jsonFile.Type == 3 {
			fmt.Println("Model connected")
			go modelServer(conn, channel, wordChannel)
		} else {
			fmt.Println("Unknown type")
		}
	}
}
