import { ChangeEventHandler, FormEvent, useState } from 'react';
import { Button, Flex, Form, Input } from '@/components/common';
import { HomeTemplate } from '@/components/home';

function RegisterPage() {
  const [id, setId] = useState('');
  const [nickName, setNickName] = useState('');
  const [password, setPassword] = useState('');

  const handleChangeID: ChangeEventHandler<HTMLInputElement> = (e) => {
    setId(e.target.value);
  };
  const handleChangeNickName: ChangeEventHandler<HTMLInputElement> = (e) => {
    setNickName(e.target.value);
  };
  const handleChangePassword: ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(id, nickName, password);
  };

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
        </Flex>
        <Button size='small' color='white'>
          CLICK!
        </Button>
      </Form>
    </HomeTemplate>
  );
}

export default RegisterPage;
