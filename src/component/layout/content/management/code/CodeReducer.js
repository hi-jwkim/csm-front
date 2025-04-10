

const CodeReducer = (state, action) => {
    switch (action.type) {
        case "subCodeList" :
            return { ...state, subCodeList: [action.list]};

        case "path" :
            
            return {...state, path: action.path}

    }
}

export default CodeReducer;