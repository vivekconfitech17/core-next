'use client'
// import { makeStyles } from '@mui/styles';
// import createBreakpoints from '@mui/material/styles';
import { alpha, darken } from '@mui/material/styles';

import { GlobalStyles } from '@mui/material'

// let paddingClasses:any = {};
// let marginClasses:any = {};
// for (let count = 1; count <= 8; count++) {
//   paddingClasses['.pt-' + count] = { paddingTop: count * 4 + 'px !important' };
//   paddingClasses['.pb-' + count] = { paddingBottom: count * 4 + 'px !important' };
//   paddingClasses['.pl-' + count] = { paddingLeft: count * 4 + 'px !important' };
//   paddingClasses['.pr-' + count] = { paddingRight: count * 4 + 'px !important' };
//   marginClasses[`.ml-${count}`] = { marginLeft: `${count * 4}px !important` };
//   marginClasses[`.mr-${count}`] = { marginRight: `${count * 4}px !important` };
//   marginClasses[`.mt-${count}`] = { marginTop: `${count * 4}px !important` };
//   marginClasses[`.mb-${count}`] = { marginBottom: `${count * 4}px !important` };
// }

// const globalStyles = makeStyles((theme:any) => ({
//   '@global': {
//     '*': {
//       boxSizing: 'border-box',
//       margin: 0,
//       padding: 0,
//       // border: '1px solid red'
//     },
//     a: {
//       textDecoration: 'none',
//       '&:hover,&:focus': {
//         textDecoration: 'none',
//       },
//       '&.disable-link': {
//         pointerEvents: 'none',
//         cursor: 'default',
//         [theme?.breakpoints?.down('xs')]: {
//           pointerEvents: 'inherit',
//           cursor: 'pointer',
//         },
//       },
//     },
//     img: {
//       maxWidth: '100%',
//     },
//     '.pointer': {
//       cursor: 'pointer',
//     },
//     '.rounded': {
//       borderRadius: '50%',
//     },
//     '.Cmt-table-responsive': {
//       minHeight: '.01%',
//       overflowX: 'auto',
//       [theme?.breakpoints?.down('sm')]: {
//         width: '100%',
//         marginBottom: 15,
//         overflowY: 'hidden',
//         border: `1px solid ${theme?.palette?.borderColor?.main}`,
//         '& > table': {
//           marginBottom: 0,
//           '& > thead > tr > th': {
//             paddingTop: 8,
//           },
//           '& > thead > tr > th, > tbody > tr > th, > tfoot > tr > th, thead > tr > td, tbody > tr > td, tfoot > tr > td': {
//             whiteSpace: 'nowrap',
//           },
//         },
//       },
//     },
//     '.dropzone': {
//       flex: 1,
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       padding: theme?.spacing?theme.spacing(10, 5):"80px 40px",
//       border: `2px dashed ${theme?.palette?.borderColor?.main}`,
//       borderRadius: 2,
//       backgroundColor: theme?.palette?.background?.default,
//       outline: 'none',
//       transition: 'border .24s ease-in-out',
//     },
//     '.swal2-shown .swal2-container': {
//       zIndex: 1104,
//     },
//     '.swal2-container .swal2-popup, .swal2-container .swal2-popup.swal2-toast': {
//       backgroundColor: theme?.palette?.popupColor?.main,
//       color: theme?.palette?.text?.primary,
//     },
//     '.swal2-container .swal2-content, .swal2-container .swal2-title': {
//       color: theme?.palette?.text?.primary,
//     },
//     '.swal2-container .swal2-footer a': {
//       color: theme?.palette?.primary?.main || '#d80e51',
//     },
//     '.swal2-container .swal2-close:focus': {
//       outline: 'none',
//     },
//     // React Big Calendar
//     '.rbc-calendar': {
//       flex: 1,
//       minHeight: 'calc(100vh - 200px)',
//       [theme?.breakpoints?.down('xs')]: {
//         minHeight: 400,
//       },
//       [theme?.breakpoints?.down(710)]: {
//         '& .rbc-toolbar': {
//           display: 'flex',
//           flexDirection: 'column',
//           flexWrap: 'nowrap',
//           alignItems: 'flex-start',
//           '& .rbc-toolbar-label': {
//             margin: '8px 0',
//             padding: 0,
//           },
//         },
//       },
//       [theme?.breakpoints?.down(500)]: {
//         '& .rbc-toolbar': {
//           fontSize: 12,
//           '& button': {
//             padding: '5px 10px',
//           },
//         },
//       },
//       '& .rbc-event': {
//         backgroundColor: theme?.palette?.primary?.main || '#d80e51',
//         minHeight: 50,
//         '&:focus': {
//           outline: 'none',
//         },
//       },
//       '& .rbc-event.rbc-selected': {
//         backgroundColor: darken(theme?.palette?.primary?.main || '#d80e51', 0.3),
//       },
//       '& .rbc-slot-selection': {
//         backgroundColor: alpha(theme?.palette?.primary?.main || '#d80e51', 0.7),
//       },
//       '& .rbc-toolbar button:active, & .rbc-toolbar button.rbc-active': {
//         color: theme?.palette?.common?.white,
//         backgroundImage: 'none',
//         backgroundColor: alpha(theme?.palette?.primary?.main || '#d80e51', 0.9),
//         borderColor: theme?.palette?.primary?.main || '#d80e51',
//       },
//       '& .rbc-toolbar button:active:hover, & .rbc-toolbar button.rbc-active:hover, & .rbc-toolbar button:active:focus, & .rbc-toolbar button.rbc-active:focus': {
//         color: theme?.palette?.common?.white,
//         backgroundColor: alpha(theme?.palette?.primary?.main || '#d80e51', 0.9),
//         borderColor: theme?.palette?.primary?.main || '#d80e51',
//       },
//       '& .rbc-toolbar button': {
//         color: theme?.palette?.text?.primary,
//       },
//       '& .rbc-toolbar button:focus, & .rbc-toolbar button:hover': {
//         color: theme?.palette?.common?.white,
//         backgroundColor: alpha(theme?.palette?.primary?.main || '#d80e51', 0.9),
//         borderColor: theme?.palette?.primary?.main || '#d80e51',
//       },
//       '& .rbc-month-row': {
//         minHeight: 100,
//       },
//       '& .rbc-off-range-bg': {
//         backgroundColor: alpha(theme?.palette?.primary?.main || '#d80e51', 0.1),
//       },
//     },
//     ...paddingClasses,
//     ...marginClasses,
//   },
// }));

// export default globalStyles;


const generateSpacingClasses = () => {
  let styles: any = {}

  for (let count = 1; count <= 8; count++) {
    styles[`.pt-${count}`] = { paddingTop: `${count * 4}px !important` }
    styles[`.pb-${count}`] = { paddingBottom: `${count * 4}px !important` }
    styles[`.pl-${count}`] = { paddingLeft: `${count * 4}px !important` }
    styles[`.pr-${count}`] = { paddingRight: `${count * 4}px !important` }
    styles[`.ml-${count}`] = { marginLeft: `${count * 4}px !important` }
    styles[`.mr-${count}`] = { marginRight: `${count * 4}px !important` }
    styles[`.mt-${count}`] = { marginTop: `${count * 4}px !important` }
    styles[`.mb-${count}`] = { marginBottom: `${count * 4}px !important` }
  }

  return styles
}

const GlobalCss = () => (
  <GlobalStyles
    styles={(theme) => ({
      '*': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        // border: '1px solid red'
      },
      a: {
        textDecoration: 'none',
        '&:hover,&:focus': {
          textDecoration: 'none',
        },
        '&.disable-link': {
          pointerEvents: 'none',
          cursor: 'default',
          [theme?.breakpoints?.down('xs')]: {
            pointerEvents: 'inherit',
            cursor: 'pointer',
          },
        },
      },
      img: {
        maxWidth: '100%',
      },
      '.pointer': {
        cursor: 'pointer',
      },
      '.rounded': {
        borderRadius: '50%',
      },
      '.Cmt-table-responsive': {
        minHeight: '.01%',
        overflowX: 'auto',
        [theme?.breakpoints?.down('sm')]: {
          width: '100%',
          marginBottom: 15,
          overflowY: 'hidden',
          border: `1px solid rgba(0, 0, 0, 0.06)`,
          '& > table': {
            marginBottom: 0,
            '& > thead > tr > th': {
              paddingTop: 8,
            },
            '& > thead > tr > th, > tbody > tr > th, > tfoot > tr > th, thead > tr > td, tbody > tr > td, tfoot > tr > td': {
              whiteSpace: 'nowrap',
            },
          },
        },
      },
      '.dropzone': {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme?.spacing?theme.spacing(10, 5):"80px 40px",
        border: `2px dashed rgba(0, 0, 0, 0.06)`,
        borderRadius: 2,
        backgroundColor: theme?.palette?.background?.default,
        outline: 'none',
        transition: 'border .24s ease-in-out',
      },
      '.swal2-shown .swal2-container': {
        zIndex: 1104,
      },
      '.swal2-container .swal2-popup, .swal2-container .swal2-popup.swal2-toast': {
        backgroundColor: '#fff',
        color: theme?.palette?.text?.primary,
      },
      '.swal2-container .swal2-content, .swal2-container .swal2-title': {
        color: theme?.palette?.text?.primary,
      },
      '.swal2-container .swal2-footer a': {
        color:  '#d80e51',
      },
      '.swal2-container .swal2-close:focus': {
        outline: 'none',
      },
      // React Big Calendar
      '.rbc-calendar': {
        flex: 1,
        minHeight: 'calc(100vh - 200px)',
        [theme?.breakpoints?.down('xs')]: {
          minHeight: 400,
        },
        [theme?.breakpoints?.down(710)]: {
          '& .rbc-toolbar': {
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            alignItems: 'flex-start',
            '& .rbc-toolbar-label': {
              margin: '8px 0',
              padding: 0,
            },
          },
        },
        [theme?.breakpoints?.down(500)]: {
          '& .rbc-toolbar': {
            fontSize: 12,
            '& button': {
              padding: '5px 10px',
            },
          },
        },
        '& .rbc-event': {
          backgroundColor: '#d80e51',
          minHeight: 50,
          '&:focus': {
            outline: 'none',
          },
        },
        '& .rbc-event.rbc-selected': {
          backgroundColor: darken('#d80e51', 0.3),
        },
        '& .rbc-slot-selection': {
          backgroundColor: alpha('#d80e51', 0.7),
        },
        '& .rbc-toolbar button:active, & .rbc-toolbar button.rbc-active': {
          color: theme?.palette?.common?.white,
          backgroundImage: 'none',
          backgroundColor: alpha('#d80e51', 0.9),
          borderColor: '#d80e51',
        },
        '& .rbc-toolbar button:active:hover, & .rbc-toolbar button.rbc-active:hover, & .rbc-toolbar button:active:focus, & .rbc-toolbar button.rbc-active:focus': {
          color: theme?.palette?.common?.white,
          backgroundColor: alpha('#d80e51', 0.9),
          borderColor:  '#d80e51',
        },
        '& .rbc-toolbar button': {
          color: theme?.palette?.text?.primary,
        },
        '& .rbc-month-view': {
          overflow: 'scroll',
        },
        '& .rbc-toolbar button:focus, & .rbc-toolbar button:hover': {
          color: theme?.palette?.common?.white,
          backgroundColor: alpha('#d80e51', 0.9),
          borderColor:  '#d80e51',
        },
        '& .rbc-month-row': {
          minHeight: 100,
        },
        '& .rbc-off-range-bg': {
          backgroundColor: alpha( '#d80e51', 0.1),
        },
      },
      ...generateSpacingClasses(),
    })}
  />
)

export default GlobalCss
