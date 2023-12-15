# Show Your Hands
## Meta-verse for learning Korean Sign Language(KSL) Easily
A Meta-verse designed for educating child deafs, or Deafs who are interested in learning KSL.

This meta-verse provides a more intuitive and interactive way for learning KSL utilizing web-cameras.
Also, by using deep-learning and a web-cam, this meta-verse teaches KSL to Deafs by recognizing their hand gestures and giving feedbacks.


## How to use

### 0. Prerequisites
#### 0.1. Running on server
- PostgreSQL 13^
- Python 3.10
- node.js 18^
- npm 8^
- yarn 1.22^
- Go 1.17^
- git
- mediapipe
- numpy
- tensorflow
- sklearn
- pandas
- joblib
- image
#### 0.2. Running on client
- Browser
- Web-cam
- Internet connection
- Python 3.10
- mediapipe
- opencv-python
- numpy
### 1. Download the project
```
git clone https://github.com/454P/Capstone_Full.git
```

### 2-1. Running server
- 5 Servers are required to run the project
#### Server for TCP Connection
```bash
cd registerTcpServer
go run server.go
```
#### Server for running the model
```bash
python modeling.py
```
#### Server for running the backend to connect with PostgreSQL
```bash
cd showyourhands
npm start
```
* Server connected with PostgreSQL uses process.env variables to connect with PostgreSQL.
* You should set the following variables in your environment.
``` text
DB_HOST
DB_USER
DB_PASSWORD
DB_DATABASE
DB_PORT
```
* This can also be done by creating a .env file in the showyourhands/src/config directory.

#### Server for running web
```bash
cd client
yarn install
yarn start
```

#### Server for running the webRTC
```bash
cd server
npm start
```

### Running client
- Before opening the web, start a web-cam and run connection for sending web-camera data to the server.
```bash
cd local_program
python app.py
```
* url needs to be set as the server's url.
* datas needs to be set as your ID and password.
  * If you don't have an ID and password, you can sign up on the web.
* HOST needs to be set as the TCP server's IP address.

- After running the connection, open the web on your browser.
- You can use the web by logging in with your ID and password.
