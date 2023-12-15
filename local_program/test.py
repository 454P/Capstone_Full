import json
from socket import *
import requests

url = 'http://localhost:8000/login'
datas = {'id': 'asap0123', 'password': 'asap0123!'}
HOST = "localhost"
TCP_PORT = 8080

def get_key():
    response = requests.post(url, data=datas)
    api = response.json()['data']['api']
    # json 저장
    dict = {'type': 2, 'api': api}
    return json.dumps(dict)

def get_word():
    response = requests.post(url, data=datas)
    api = response.json()['data']['api']
    # json 저장
    dict = {'type': 2, 'api': api, 'word': '나'}
    return json.dumps(dict)

if __name__=="__main__":
    data = get_key()

    # TCP connection
    byte_data = bytes(data,'utf-8')
    clientSocket = socket(AF_INET, SOCK_STREAM)
    clientSocket.connect((HOST, TCP_PORT))
    clientSocket.send(byte_data)
    end_msg = "0000000000"
    clientSocket.send(bytes(end_msg,'utf-8'))
    data2 = get_word()
    clientSocket.send(bytes(data2,'utf-8'))
    clientSocket.send(bytes(end_msg,'utf-8'))