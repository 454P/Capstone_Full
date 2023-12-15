import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { SpaceStyle } from '@/types/boxStyle';
import type { Colors } from '@/styles/colors';
import type { TypographyVariant } from '@/styles/typography';

interface TypographyProps {
  font?: TypographyVariant;
  color?: Colors;
}

type Props = TypographyProps & SpaceStyle;

const Typography = styled.span<Props>`
  ${({ theme, font, color, margin, padding }) => {
    return css`
      color: ${color && theme.colors[color]};
      ${font && theme.typography[font]}
      ${{
        margin,
        padding,
      }}
    `;
  }}
`;

export default Typography;
