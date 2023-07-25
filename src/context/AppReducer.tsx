
export const AppReducer = (state: any, action: any) => {
  switch (action.type) {
      case 'UPDATE_ACCOUNT':
          return {
              ...state,
              account: action.payload
          }

      default:
          return state;
  };
}