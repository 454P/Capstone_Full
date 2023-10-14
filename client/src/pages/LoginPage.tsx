import { ChangeEventHandler, FormEvent, useState } from 'react';
import { Button, Flex, Form, Input } from '@/components/common';
import { HomeTemplate } from '@/components/home';

function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleChangeID: ChangeEventHandler<HTMLInputElement> = (e) => {
    setId(e.target.value);
  };
  const handleChangePassword: ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(id, password);
  };

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
