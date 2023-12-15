import { ChangeEventHandler, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { Button, Flex, Form, Input } from '@/components/common';
import { HomeTemplate } from '@/components/home';

function RegisterPage() {
  const [id, setId] = useState('');
  const [nickName, setNickName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleChangeID: ChangeEventHandler<HTMLInputElement> = (e) => {
    setId(e.target.value);
  };
  const handleChangeNickName: ChangeEventHandler<HTMLInputElement> = (e) => {
    setNickName(e.target.value);
  };
  const handleChangePassword: ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value);
  };
  const handleChangeEmail: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register();
  };

  const initForm = () => {
    setId('');
    setNickName('');
    setPassword('');
    setEmail('');
  };

  async function register() {
    try {
      await axios.post('http://49.142.76.124:8000/signup', {
        id: id,
        password: password,
        nickname: nickName,
        email: email,
      });
      alert('회원가입 완료!');
      navigate('/login');
    } catch (error) {
      const { response } = error as unknown as AxiosError;
      if (response?.status === 401) alert('중복되는 아이디입니다.');
      initForm();
    }
  }

  return (
    <HomeTemplate>
      <Form onSubmit={handleSubmitForm}>
        <Flex flexDirection='column' gap={20}>
          <Input type='text' name='아이디' value={id} placeholder='아이디를 입력하세요.' onChange={handleChangeID} />
          <Input
            type='text'
            name='닉네임'
            value={nickName}
            placeholder='닉네임을 입력하세요.'
            onChange={handleChangeNickName}
          />
          <Input
            type='password'
            name='비밀번호'
            value={password}
            placeholder='비밀번호를 입력하세요.'
            onChange={handleChangePassword}
          />
          <Input
            type='text'
            name='이메일'
            value={email}
            placeholder='이메일을 입력하세요.'
            onChange={handleChangeEmail}
          />
        </Flex>
        <Button size='small' color='white'>
          CLICK!
        </Button>
      </Form>
    </HomeTemplate>
  );
}

export default RegisterPage;
