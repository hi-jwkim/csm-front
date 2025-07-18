import { useState, useEffect } from "react";
import Exit from "../../../../../assets/image/exit.png";
import Input from "../../../../module/Input"
import { dateUtil } from "../../../../../utils/DateUtil";
import Modal from "../../../../module/Modal";
import { roleGroup, useUserRole } from "../../../../../utils/hooks/useUserRole";

/**
 * @description: 상세화면 모달 컴포넌트
 * 
 * @author 작성자: 정지영
 * @created 작성일: 
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Input.jsx
 * 
 * @additionalInfo
 * - props: 
 *  isOpen: true|false (오픈여부) 
 *  gridMode: "SAVE"|"DETAIL"|"EDIT"|"REMOVE" (모드 선택)
 *  funcModeSet: fuction("SAVE"|"DETAIL"|"EDIT"|"REMOVE") (부모 컴포넌트 모드 변경)
 *  editBtn: true|false (수정버튼 여부) 
 *  removeBtn: true|false (삭제버튼 여부) 
 *  title: 제목
 *  detailData: Input 컴포넌트 props 리스트
 *  selectList: Input 컴포넌트 selectData props
 *  exitBtnClick: 종료버튼 fuction
 *  saveBtnClick: 저장버튼 function (저장, 수정 둘다 포함)
 *  removeBtnClick: 삭제버튼 function
 */
const NoticeModal = ({ data, isOpen, gridMode, funcModeSet, editBtn, removeBtn, title, detailData, selectList, exitBtnClick, saveBtnClick, removeBtnClick, isCancle = true, isCopy = false, copyBtnClick }) => {

    
    const {isRoleValid} = useUserRole();

    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState([]);
    const [initialData, setInitialData] = useState([]); // 원본 데이터 저장
    const [isDeleteModal, setIsDeleteModal] = useState(false);

    // "X"
    const handleExit = () => {
        setFormData([]); // 데이터 초기화
        setIsEditfalse();
        exitBtnClick();
    };

    // "취소" 버튼 클릭 시 원래 데이터로 복구
    const handleCancel = () => {
        setFormData(initialData); // 초기 데이터로 되돌리기
        setIsEditfalse();
    };

    // "복사" 버튼 클릭 시 현재 데이터 반환
    const handleCopy = () => {

        copyBtnClick(formData);
    }

    // 입력값 변경 핸들러
    const handleInputChange = (index, newValue) => {
        setFormData((prevFormData) => {
            // 변경된 항목 값 변경
            const updatedData = prevFormData.map((item, idx) =>
              idx === index ? { ...item, value: newValue } : item
            );

            // 체크박스에 의존된 Input컴포넌트 숨김/보이기 처리
            const changedItem = prevFormData[index];
            if (changedItem && changedItem.triggerHideId) {
              const parentId = changedItem.triggerHideId;
              return updatedData.map((item) => {
                if (item.dependency && item.dependency[1] === parentId) {
                  const newDependency = [...item.dependency];
                  newDependency[2] = newValue === 'Y' ? 'N' : newValue === 'N' ? 'Y' : newDependency[2];
                  return { ...item, dependency: newDependency };
                }
                return item;
              });
            }
        
            return updatedData;
        });
    };

    // 수정모드로 변경
    const handleEditMode = () => {
        funcModeSet("EDIT");
        setIsEdit(true);
    }

    // 저장, 수정
    const handleSave = (e) => {
        document.body.style.overflow = 'unset';
        saveBtnClick(formData, gridMode);  // 최종 데이터를 전달  
    };

    // 삭제
    const handleRemoveModal = () => {
        setIsDeleteModal(true);
    }
    const handleRemove = () => {
        removeBtnClick(formData);
        setIsDeleteModal(false);
    }

    // 편집모드 해제
    const setIsEditfalse = () => {
        if (gridMode === "EDIT"){
            funcModeSet("DETAIL");
            setIsEdit(false); // 편집 모드 해제
        }
    }

    const reload = () => {
        // () => setIsDeleteModal(false)
        navigator(0);
    }

    // detailData가 변경될 때 상태를 업데이트 (최초 데이터 저장)
    useEffect(() => {
        if (detailData && detailData.length > 0) {
            const newData = detailData.map(item => {
                if (item.dependency) {
                  const depTriggerId = item.dependency[1];
                  const targetItem = detailData.find(otherItem => otherItem.triggerHideId === depTriggerId);
                  
                  if (targetItem) {
                    let newDepValue = "Y";
                    if (targetItem.value === "Y") {
                      newDepValue = "N";
                    } else if (targetItem.value === "N") {
                      newDepValue = "Y";
                    }
                    return {
                      ...item,
                      dependency: [item.dependency[0], item.dependency[1], newDepValue],
                    };
                  }
                }
                return item;
            });
        
            setFormData(newData);
            setInitialData(newData); // 초기 데이터 저장
        }
    }, [detailData]);

    // 모달 오픈 시 스크롤
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setFormData([]);
        }

    }, [isOpen]);


    // 모드 변경
    useEffect(() => {
        if (gridMode === "SAVE" || gridMode === "EDIT" || gridMode === "COPY") {
            setIsEdit(true);
        }else {
            setIsEdit(false);
        }
    }, [gridMode]);

    // 모달 오픈 시 스크롤
    useEffect(() => {
            if (isOpen) {
                document.body.style.overflow = "hidden";
    
                // 엔터 키 이벤트 핸들러
                const handleKeyDown = (event) => {
                    if (event.key === "Escape") {
                        handleExit();
                    }
                };
    
                document.addEventListener("keydown", handleKeyDown);
    
                return () => {
                    document.body.style.overflow = "unset";
                    document.removeEventListener("keydown", handleKeyDown);
                };
            }
        }, [isOpen]);

    return (
        <div>
            <Modal
                isOpen={isDeleteModal}
                title={title}
                text={"삭제하시겠습니까?"}
                confirm={"예"}
                cancel={"아니오"}
                fncConfirm={handleRemove}
                fncCancel={reload}
            />
            {isOpen ? (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ height: "50px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "0px", marginRight: "5px", marginLeft: "5px" }}>
                            {/* 왼쪽 - 제목 */}
                            <h2 style={h2Style}>{title}</h2>

                            {/* 오른쪽 - 버튼 & 닫기 아이콘 */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {
                                    gridMode === "SAVE" ?
                                        <div>
                                            <button className="btn btn-primary" onClick={handleSave} name="confirm" style={{marginRight:"10px"}}>
                                                저장
                                            </button>
                                        </div>
                                    :
                                        isEdit ?
                                            <div>
                                                <button className="btn btn-primary" onClick={handleSave} name="confirm" style={{marginRight:"10px"}}>
                                                    저장
                                                </button>   
                                                {
                                                    isCancle ?
                                                        <button className="btn btn-primary" onClick={handleCancel} name="confirm" style={{marginRight:"10px"}}>
                                                            취소
                                                        </button> 
                                                    : null
                                                }
                                            </div>
                                        :
                                            <div>
                                                {
                                                    isRoleValid(roleGroup.NOTICE_ADD_MANAGER) && isCopy ?
                                                        <button type="button" className="btn btn-primary" onClick={handleCopy} name="confirm" style={{marginRight:"10px"}}>
                                                            복사
                                                        </button>
                                                    : null
                                                }
                                                {
                                                    isRoleValid(roleGroup.NOTICE_ALL_MOD_MANAGER) || editBtn ? 
                                                        <button type="button" className="btn btn-primary" onClick={handleEditMode} name="confirm" style={{marginRight:"10px"}}>
                                                            수정
                                                        </button>
                                                    : null
                                                }
                                                {
                                                    isRoleValid(roleGroup.NOTICE_ALL_MOD_MANAGER) || removeBtn ?
                                                        <button className="btn btn-primary" onClick={handleRemoveModal} name="confirm" style={{marginRight:"10px"}}>
                                                            삭제
                                                        </button>
                                                    : null
                                                }
                                            </div>
                                }
                                

                                <div onClick={handleExit} style={{ cursor: "pointer" }}>
                                    <img src={Exit} style={{ width: "35px" }} alt="Exit" />
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflow: 'auto' }}>
                            {
                                gridMode === "DETAIL" ? 
                                <>
                                    { data !== null ? (
                                            <div className="m-2">
                                            <div className="my-2 p-3 form-control">

                                                <div className="row">
                                                    <div className="col-md-1 fw-bold">제목</div>
                                                    <div className="col-md-7">{data.title}</div>
                                                    <div className="col-md-1 fw-bold">상시공지</div>
                                                    <div className="col-md-2">{data.is_important}</div>
                                                </div>
                                                <div className="row mt-2">
                                                <div className="col-md-1 fw-bold">프로젝트</div>
                                                <div className="col-md-7">{data.job_name}</div>
                                                <div className="col-md-1 fw-bold">지역</div>
                                                <div className="col-md-3">{data.job_loc_name}</div>
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-md-1 fw-bold">게시일</div>
                                                    <div className="col-md-4">{dateUtil.format(data.posting_start_date, "yyyy-MM-dd")} ~ {dateUtil.format(data.posting_end_date, "yyyy-MM-dd")}</div>
                                                    <div className="col-md-1 fw-bold">수정일</div>
                                                    <div className="col-md-2">{dateUtil.format(data.mod_date, "yyyy-MM-dd")}</div>                                 
                                                    <div className="col-md-1 fw-bold">등록자</div>
                                                    <div className="col-md-3">{data.user_info}</div>
                                                </div>
                                            </div>

                                            <div className="my-3 p-3 form-control overflow-auto Scrollbar" style={{padding: '0.5rem', height:"45vh"}} dangerouslySetInnerHTML={{ __html:data.content
                                             }}>
                                            </div>
                                            
                                            </div> 
                                            )
                                        :
                                        null
                                    }
                                </>                          
                                :
                                <div style={gridStyle}>
                                    {formData.length === 0 ? null : 
                                        formData.map((item, idx) => (
                                            item.type === "hidden" ? null : (
                                                <Input
                                                    key={idx}
                                                    editMode={isEdit}
                                                    type={item.type}
                                                    span={item.span}
                                                    label={item.label}
                                                    value={item.value}
                                                    onValueChange={(newValue) => handleInputChange(idx, newValue)}
                                                    selectData={item.type === "select" ? selectList[item.selectName] : null}
                                                    checkedLabels={item.checkedLabels}
                                                    radioValues={item.radioValues}
                                                    radioLabels={item.radioLabels}
                                                    textFormat={item.format}
                                                    isHide={item.dependency && item.dependency[2] === 'Y' ? true : false}
                                                    isRequired={item.isRequired}
                                                    isAll={item.isAll}
                                                />
                                            )
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '5fr 1fr',  // 한 행에 두 개의 열
    gap: '1rem',  // 요소 간의 간격 설정
    border: '2px solid #a5a5a5',
    borderRadius: '10px',
    padding: '10px',
    width: '100%', 
    // height: '95%',
    overflowX: 'auto',            // 가로 스크롤
    overflowY: 'auto',            // 세로 스크롤
    marginTop: "5px",
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9998',
};

const modalStyle = {
    backgroundColor: '#fff',
    padding: '5px',
    borderRadius: '8px',
    maxWidth: '1200px',
    width: '95%',
    height: '70vh',
    maxHeight: '90vh',
    boxShadow: '15px 15px 1px rgba(0, 0, 0, 0.3)',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
};

const h2Style = {
    // minHeight: '50px',
    fontSize: '25px',
    paddingTop: '5px',
    paddingLeft: '5px',
};

export default NoticeModal;
