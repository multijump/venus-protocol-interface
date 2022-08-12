import { css } from '@emotion/react';
import { useTheme } from '@mui/material';

export const useStyles = () => {
  const theme = useTheme();
  return {
    received: css`
      color: ${theme.palette.interactive.success};
      transform: rotate(270deg);
      margin-right: ${theme.spacing(2.5)};
    `,
    sent: css`
      color: ${theme.palette.interactive.error};
      transform: rotate(90deg);
      margin-right: ${theme.spacing(2.5)};
    `,
    action: css`
      display: inline-flex;
      align-items: center;
    `,
    anchorButton: css`
      ${theme.breakpoints.down('sm')} {
        margin: ${theme.spacing(4)} 0 0 0;
        background-color: transparent;
      }
    `,
    icon: css`
      border-radius: 50%;
      width: ${theme.shape.iconSize.medium}px;
      height: ${theme.shape.iconSize.medium}px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: ${theme.spacing(2.5)};

      svg {
        color: ${theme.palette.text.primary};
        width: ${theme.spacing(2)};
        height: ${theme.spacing(2)};
      }
    `,
    for: css`
      background-color: ${theme.palette.interactive.success};
    `,
    abstain: css`
      background-color: ${theme.palette.text.secondary};
    `,
    against: css`
      background-color: ${theme.palette.interactive.error};
    `,
  };
};
