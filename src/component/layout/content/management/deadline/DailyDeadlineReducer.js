import { ObjChk } from "../../../../../utils/ObjChk";

const DailyDeadlineReducer = (state, action) => {
    switch(action.type){
        case "FILE_INIT":
            let uploadList = [];
            let tbmList = [];
            ObjChk.ensureArray(action.list).find(item => {
                if(item.file_type === "TBM"){
                    tbmList.push(item);
                }else{
                    uploadList.push(item);
                }
            });

            return {...state, uploadList: structuredClone(uploadList), tbmList: structuredClone(tbmList)};

        case "FILE_EMPTY":
            return {...state, uploadList: [], tbmList: []};

        case "DEPARTMENT":
            return {...state, departList: structuredClone(action.options)};

        case "DEPART_EMPTY":
            return {...state, departList: structuredClone([...state.initDepartList])};

        case "NOT_TBM_FILE":
            const nonTbmFileList = state.uploadList.filter(item => item.file_type !== "TBM");
            return {...state, uploadList: structuredClone(nonTbmFileList)};

        case "SELECT_TBM_FILE":
            const findTbmFile = state.tbmList.find(item => item.file_path.includes(action.value));
            const notTbmFileList = state.uploadList.filter(item => item.file_type !== "TBM");
            let newUploadFile = [];
            if(findTbmFile === undefined){
                newUploadFile = [...notTbmFileList];
            }else{
                newUploadFile = [...notTbmFileList, findTbmFile];
            }
            return {...state, uploadList: structuredClone(newUploadFile)}

        default:
            return state;
    }
}

export default DailyDeadlineReducer;