import { useState, useEffect, useReducer, useRef } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import SiteBaseReducer from "./SiteBaseReducer";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import Table from "../../../../module/Table";
import Button from "../../../../module/Button";
import DateInput from "../../../../module/DateInput";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import useTableControlState from "../../../../../utils/hooks/useTableControlState";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons ";
import { useAuth } from "../../../../context/AuthContext";
import Search from "../../../../module/search/Search";
import EditTable from "../../../../module/EditTable";
import "react-calendar/dist/Calendar.css";
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Calendar.css";
import { ObjChk } from "../../../../../utils/ObjChk";

/**
 * @description: 현장 근로자 관리
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-18
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - ReactPaginate: 페이지 버튼
 * - Select: 셀렉트 박스
 * - Loading: 로딩 스피너
 * - Modal: 알림 모달
 * - Table: 테이블
 * - Button: 버튼
 * - DateInput: 날짜 입력
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /site-base (현장 근로자 조회)
 */
const SiteBase = () => {
    const [state, dispatch] = useReducer(SiteBaseReducer, {
        list: [],
        count: 0,
        initialList: [],
        siteNmList: [],
    })

    const [searchStartTime, setSearchStartTime] = useState(dateUtil.now());
    const [searchEndTime, setSearchEndTime] = useState(dateUtil.now());
    const { user, project } = useAuth();
    const tableRef = useRef();

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, retrySearchText, setRetrySearchText, editList, setEditList } = useTableControlState(100);

    const [isLoading, setIsLoading] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [isEditTable, setIsEditTable] = useState(false);
    const [isEditTableOpen, setIsEditTableOpen] = useState(true);

    // 테이블 컬럼 정보
    const columns = [
        { isSearch: false, isOrder: true, width: "70px", header: "순번", itemName: "rnum", bodyAlign: "center", isEllipsis: false},
        { isSearch: true, isOrder: true, width: "190px", header: "아이디", itemName: "user_id", bodyAlign: "center", isEllipsis: false },
        { isSearch: true, isOrder: true, width: "190px", header: "근로자 이름", itemName: "user_nm", bodyAlign: "left", isEllipsis: false },
        { isSearch: true, isOrder: true, width: "190px", header: "부서/조직명", itemName: "department", bodyAlign: "left", isEllipsis: false },
        { isSearch: false, isOrder: true, width: "190px", header: "날짜", itemName: "record_date", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'format' },
        { isSearch: false, isOrder: true, width: "190px", header: "출근시간", itemName: "in_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'formatTime24' },
        { isSearch: false, isOrder: true, width: "190px", header: "퇴근시간", itemName: "out_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'formatTime12' },
        { isSearch: false, isOrder: true, width: "190px", header: "상태", itemName: "commute", bodyAlign: "center", isEllipsis: false, isRadio: true, radioValues: ["출근", "퇴근"], radioLabels: ["출근", "퇴근"] },
        { isSearch: false, isOrder: true, width: "190px", header: "마감여부", itemName: "is_deadline", bodyAlign: "center", isEllipsis: false, isChecked: true },
    ];

    // 테이블 수정 정보
    const editInfo = [
        {itemName: "rnum", editType: "delete"},
        {itemName: "user_id", editType: "searchModal", selectedModal: "workerByUserId"},
        {itemName: "user_nm", editType: "", dependencyModal: "workerByUserId"},
        {itemName: "department", editType: "", dependencyModal: "workerByUserId"},
        {itemName: "record_date", editType: "", dependencyModal: "workerByUserId"},
        {itemName: "in_recog_time", editType: "time24", defaultValue: "2006-01-02T08:00:00+09:00"},
        {itemName: "out_recog_time", editType: "time12", defaultValue: "2006-01-02T17:00:00+09:00"},
        {itemName: "commute", editType: "radio", radioValues: ["출근", "퇴근"], radioLabels: ["출근", "퇴근"], defaultValue: "퇴근"},
        // {itemName: "commute", editType: "toggleText", toggleTexts: ["출근", "퇴근"]},
        {itemName: "is_deadline", editType: "check"},
    ];

    // 검색 옵션
    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "USER_ID", label: "아이디" },
        { value: "USER_NM", label: "근로자 이름" },
        { value: "DEPARTMENT", label: "부서/조직명" },
    ];

    // 테이블 수정상태로 변경
    const onClickEditBtn = () => {
        setIsEdit(true);
        if (tableRef.current) {
            tableRef.current.editTableMode("rnum");
        }
    }

    // 테이블 수정상태 취소
    const onClickEditCancelBtn = () => {
        setIsEdit(false);
        if (tableRef.current) {
            tableRef.current.editModeCancel();
        }
    }

    // 테이블 수정상태 - 추가버튼클릭 
    // const onClickEditAddBtn = () => {
    //     if (tableRef.current) {
    //         tableRef.current.addTableEmptyRow("rnum");
    //     }
    // }

    // 시작날짜 선택 이벤트
    const onChangeSearchStartTime = (value) => {
        if (value <= searchEndTime) {
            setSearchStartTime(value);
        }else{
            setSearchStartTime(value);
            setSearchEndTime(value);
        }
    }
    // 종료날짜 선택 이벤트
    const onChangeSearchEndTime = (value) => {
        if (value >= searchStartTime) {
            setSearchEndTime(value);
        }else{
            setSearchEndTime(value);
            setSearchStartTime(value);
        }
    }

    // 추가/수정 근로자 저장
    const onClickSave = async() => {
        setModalText("근로자 추가/수정")
        // 유효성 검사   
        for(const item of editList){
            if(ObjChk.all(item.user_id)){   // 아이디
                setIsModal(true);
                setModalText("근로자를 선택하세요.");
                return;
            } else if(ObjChk.all(item.user_nm)){   // 이름

            } else if(ObjChk.all(item.department)){   // 부서

            } else if(!dateUtil.isDate(item.record_date)){   // 날짜
                setIsModal(true);
                setModalText("날짜를 입력하세요.");
                return;
            } else if(ObjChk.all(item.in_recog_time)){   // 출근시간
    
            } else if(ObjChk.all(item.out_recog_time)){   // 퇴근시간
    
            } else if(item.is_deadline === "Y"){   // 마감여부
                if(ObjChk.all(item.in_recog_time)){
                    setIsModal(true);
                    setModalText("출근 시간을 입력하세요.");
                    return;
                }
                if(ObjChk.all(item.out_recog_time)){
                    setIsModal(true);
                    setModalText("출근 시간을 입력하세요.");
                    return;
                }
            }
        }

        // 데이터 저장/수정
        let params = [];
        editList.forEach(item => {
            const record_date = dateUtil.isYYYYMMDD(item.record_date) ? item.record_date : dateUtil.format(item.record_date);
            const param = {
                sno: project.sno,
                jno: project.jno,
                user_id: item.user_id,
                record_date: dateUtil.goTime(record_date),
                in_recog_time: dateUtil.goTime(record_date + "T" + item.in_recog_time.split("T")[1]),
                out_recog_time: dateUtil.goTime(record_date + "T" + item.out_recog_time.split("T")[1]),
                is_deadline: item.is_deadline,
                mod_user: user.user_nm,
                mod_uno: user.uno,
            }
            params.push(param);
        });
        
        setIsLoading(true);
        const res = await Axios.POST("/worker/site-base", params);
        
        if (res?.data?.result === "Success") {
            setIsModal(true);
            setModalText("근로자 추가/수정에 성공하였습니다.");
            if(tableRef.current){
                tableRef.current.editModeCancel();
            }
            getData();
        }else {
            setIsModal(true);
            setModalText("근로자 추가/수정에 실패하였습니다.");
        }

        setIsLoading(false);
    }

    // 현장 근로자 조회
    const getData = async () => {
        if (project === null) {
            setIsModal(true);
            setModalTitle("현장 근로자 조회");
            setModalText("프로젝트를 선택해주세요.");
            return;
        }

        setIsLoading(true);

        if (project.sno == null) return;

        const res = await Axios.GET(`/worker/site-base?page_num=${pageNum}&row_size=${rowSize}&order=${order}&rnum_order=${rnumOrder}&search_start_time=${searchStartTime}&search_end_time=${searchEndTime}&jno=${project.jno}&user_id=${searchValues.user_id}&user_nm=${searchValues.user_nm}&department=${searchValues.department}&retry_search=${retrySearchText}`);
        
        if (res?.data?.result === "Success") {
            if(res?.data?.values?.list.length === 0) {
                setIsModal(true);
                setModalTitle("현장 근로자 조회");
                setModalText("조회된 현장 근로자 데이터가 없습니다.");
            }
            dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count });
        }

        setIsLoading(false);
    };

    const { 
        searchValues,
        activeSearch, setActiveSearch, 
        isSearchReset,
        isSearchInit,
        handleTableSearch,
        handleRetrySearch,
        handleSearchChange,
        handleSearchInit,
        handleSortChange,
        handlePageClick,
        handleEditList,
    } = useTableSearch({ columns, getDataFunction: getData, retrySearchText, setRetrySearchText, pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, setEditList });

    /***** useEffect *****/

    // 상단 프로젝트 변경
    useEffect(() => {
        getData();
    }, [project, searchStartTime, searchEndTime]);

    // 시작 날짜보다 끝나는 날짜가 빠를 시: 끝나는 날짜를 변경한 경우 (시작 날짜를 끝나는 날짜로)
    useEffect(() => {
        if (searchStartTime > searchEndTime) {
            setSearchStartTime(searchEndTime)
        }
    }, [searchEndTime]);

    // 시작 날짜보다 끝나는 날짜가 빠를 시: 시작 날짜를 변경한 경우 (끝나는 날짜를 시작 날짜로)
    useEffect(() => {
        if (searchStartTime > searchEndTime) {
            setSearchEndTime(searchStartTime)
        }
    }, [searchStartTime]);

    useEffect(() => {
        if(editList.length > 0){
            setIsEditTable(true);
        }else{
            setIsEditTable(false);
        }
    }, [editList]);

    return(
        <div>
            <Loading isOpen={isLoading} />
            <Modal 
                isOpen={isModal}
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <div>
                <div className="container-fluid px-4">
                    <ol className="breadcrumb mb-2 content-title-box">
                        <li className="breadcrumb-item content-title">현장 근로자</li>
                        <li className="breadcrumb-item active content-title-sub">근로자 관리</li>
                        <div className="table-header-right">
                            {
                                isEditTable ?
                                    isEditTableOpen ?
                                        <Button text={"수정 숨김"} onClick={() => setIsEditTableOpen(false)} />
                                    :   <Button text={"수정 확인"} onClick={() => setIsEditTableOpen(true)} />
                                : null
                            }
                            {
                                isEditTable ?
                                    <Button text={"저장"} onClick={onClickSave} />
                                : null
                            }
                            {
                                isEdit ? 
                                    <>
                                        <Button text={"취소"} onClick={onClickEditCancelBtn} />
                                        {/* <Button text={"추가"} onClick={onClickEditAddBtn} /> */}
                                    </>
                                :   state.list.length > 0 ?
                                        <Button text={"수정"} onClick={onClickEditBtn} />
                                    :   null
                            }
                        </div>
                    </ol>
                    
                    {
                        isEditTableOpen ?
                            <div className="table-wrapper" style={{marginBottom: "5px"}}>
                                <div className="table-container" style={{overflow: "auto", maxHeight: "calc(100vh - 350px)"}}>
                                    <EditTable
                                        isOpen={isEditTable}
                                        columns={columns}
                                        data={editList}
                                    />
                                </div>
                            </div>
                        :   null
                    }

                    <div className="table-header">
                        <div className="table-header-left" style={{gap:"10px"}}>

                            <div>
                                조회기간 <DateInput time={searchStartTime} setTime={(value) => onChangeSearchStartTime(value)}></DateInput> ~ <DateInput time={searchEndTime} setTime={(value) => onChangeSearchEndTime(value)}></DateInput>
                            </div>
                    
                        </div>
                        
                        <div className="table-header-right">
                            {
                                isSearchInit ? <Button text={"초기화"} onClick={handleSearchInit}  style={{marginRight: "2px"}}/> : null
                            }
                            <Search 
                                searchOptions={searchOptions}
                                width={"230px"}
                                fncSearchKeywords={handleRetrySearch}
                                retrySearchText={retrySearchText}
                            /> 
                        </div>
                    </div>
                    <div className="table-header">
                        <div className="table-header-right">
                            <div id="search-keyword-portal"></div>
                        </div>
                    </div>
                    
                    <div className="table-wrapper">
                        <div className="table-container" style={{overflow: "auto", maxHeight: "calc(100vh - 350px)"}}>
                            <Table 
                                ref={tableRef}
                                columns={columns} 
                                data={state.list} 
                                searchValues={searchValues}
                                onSearch={handleTableSearch} 
                                onSearchChange={handleSearchChange} 
                                activeSearch={activeSearch} 
                                setActiveSearch={setActiveSearch} 
                                resetTrigger={isSearchReset}
                                onSortChange={handleSortChange}
                                isHeaderFixed={true}
                                isEdit={isEdit}
                                editInfo={editInfo}
                                onChangeEditList={handleEditList}
                            />
                        </div>
                    </div>
                    <div>
                        <PaginationWithCustomButtons
                            dataCount={state.count}
                            rowSize={rowSize}
                            fncClickPageNum={handlePageClick}
                         />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SiteBase;