import { css } from '@emotion/react';
import { useTheme } from '@mui/material';

export const useStyles = () => {
  const theme = useTheme();
  return {
    root: css`
      display: flex;
      flex-direction: column;
      padding: ${theme.spacing(6)} 0;

      ${theme.breakpoints.down('sm')} {
        background-color: transparent;
      }
    `,
    horizontalPadding: css`
      margin: 0 ${theme.spacing(6)};
    `,
    table: css`
      display: block;

      ${theme.breakpoints.down('sm')} {
        display: none;
      }
    `,
    cards: css`
      display: none;

      ${theme.breakpoints.down('sm')} {
        display: block;
      }
    `,
    cardContentGrid: css`
      padding-top: ${theme.spacing(4)};
      padding-bottom: ${theme.spacing(4)};

      .table__table-cards__card-content {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        row-gap: ${theme.spacing(5)};
      }

      ${theme.breakpoints.down('sm')} {
        background-color: transparent;
      }
    `,
    anchorButton: css`
      ${theme.breakpoints.down('sm')} {
        margin: ${theme.spacing(4)} 0 0 0;
        background-color: transparent;
      }
    `,
    spinner: css`
      ${theme.breakpoints.down('xl')} {
        margin-bottom: ${theme.spacing(4)};
      }
    `,
  };
};
