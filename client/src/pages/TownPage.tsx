import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import config from '@/game/config';
import { emitter } from '@/game/scenes/constants';
import { socketState } from '@/states';
import { useRecoilValue } from 'recoil';
import Chat from '@/components/Chat/Chat';
import MultiVideo from '@/components/Video/MultiVideo';

function TownPage() {
  const ref = useRef<HTMLDivElement>(null);
  const mySocket = useRecoilValue(socketState);

  useEffect(() => {
    if (!mySocket.isReady) return;

    emitter.on('init', () => {
      emitter.emit('initPlayer', mySocket);
    });

    if (!ref.current) return;

    const game = new Phaser.Game({
      ...config,
      parent: ref.current,
    });

    return () => {
      emitter.removeAllListeners();
      game.destroy(true);
    };
  }, [mySocket]);

  return (
    <div>
      <MultiVideo />
      <RowContainer>
        <div ref={ref} />
        <Chat />
      </RowContainer>
    </div>
  );
}

export default TownPage;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
