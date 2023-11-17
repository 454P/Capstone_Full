import { ChangeEventHandler, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketState } from '@/states';
import axios, { AxiosError } from 'axios';
import { useRecoilState } from 'recoil';
import { Button, Flex, Form, Input } from '@/components/common';
import { HomeTemplate } from '@/components/home';

function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [socket, setSocket] = useRecoilState(socketState);

  const handleChangeID: ChangeEventHandler<HTMLInputElement> = (e) => {
    setId(e.target.value);
  };
  const handleChangePassword: ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login();
  };

  const initForm = () => {
    setId('');
    setPassword('');
  };

  const enterTown = async (nickname: string, apiKey: string) => {
    setSocket((old) => {
      const newSocket = { ...old, nickname: nickname, apiKey: apiKey };
      socket.socket.emit('start sign', apiKey);
      return newSocket;
    });
  };

  async function login() {
    try {
      const response = await axios.post('http://49.142.76.124:8000/login', {
        id: id,
        password: password,
      });
      console.log(response);
      if (response.data.status === 200) {
        await enterTown(response.data.data.nickname, response.data.data.api);
        navigate('/town');
      } else if (response.status === 204) {
        alert('없는 아이디입니다!');
        initForm();
      }
    } catch (error) {
      const { response } = error as unknown as AxiosError;
      if (response?.status === 401) {
        alert('비밀번호가 틀렸습니다!');
        initForm();
      }
    }
  }
  return (
    <HomeTemplate>
      <Form onSubmit={handleSubmitForm}>
        <Flex flexDirection='column' gap={30}>
          <Input type='text' name='아이디' value={id} placeholder='아이디를 입력하세요.' onChange={handleChangeID} />
          <Input
            type='password'
            name='비밀번호'
            value={password}
            placeholder='비밀번호를 입력하세요.'
            onChange={handleChangePassword}
          />
        </Flex>
        <Button size='small' color='white'>
          CLICK!
        </Button>
      </Form>
    </HomeTemplate>
  );
}

export default LoginPage;
