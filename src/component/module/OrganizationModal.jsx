
import { useEffect, useState } from "react";
import Exit from "../../assets/image/exit.png";
import { Axios } from "../../utils/axios/Axios";
import { useAuth } from "../context/AuthContext";
import "../../assets/css/Table.css"

// 조직도 모달
const OrganizationModal = ({isOpen, fncExit}) => {
    // 조직도 상세 모달 오픈 코드
    const { project } = useAuth();
    const [ client, setClient ] = useState([]);
    const [ hitech, setHitech ] = useState([]);
    const handleExitScrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        fncExit();
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";

            // 엔터 키 이벤트 핸들러
            const handleKeyDown = (event) => {
                if (event.key === "Escape") {
                    fncExit();
                }
            };

            document.addEventListener("keydown", handleKeyDown);

            return () => {
                document.body.style.overflow = "unset";
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [isOpen]);

    const getOrganization = async () => {
        if (project?.jno != null) {
            const res = await Axios.GET(`/project/organization/${project.jno}`)
            if(res?.data?.result == "Success"){
                setClient(res?.data?.values?.client)
                setHitech(res?.data?.values?.hitech)
            }
            console.log(res)

        }
    }

    useEffect (() => {
        getOrganization()
    }, [project])

    return <>
    {
                isOpen ?
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#ddd", borderRadius: "5px", height: "40px", margin : "5px 0px"}}>
                            <h2 style={{fontSize: "15px", color: "black", paddingLeft: "10px"}}>조직도</h2>

                            <div onClick={handleExitScrollUnset} style={{ cursor: "pointer" }}>
                                <img src={Exit} style={{ width: "30px", paddingBottom: '0px', marginRight: "5px" }} alt="Exit" />
                            </div>
                        </div>
                        <div className="table-container" style={tableStyle}>
                            <table>
                                <thead className="fixed">
                                    <tr>
                                        <th        >공종</th>
                                        <th style={{width: "120px"}}>담당</th>
                                        <th style={{width: "140px"}}>담당상세</th>
                                        <th style={{width: "110px"}}>이름</th>
                                        <th style={{width: "110px"}}>직위</th>
                                        <th style={{width: "145px"}}>소속</th>
                                        <th style={{width: "125px"}}>핸드폰</th>
                                        <th style={{width: "125px"}}>전화</th>
                                        <th className="fixed-left">이메일</th>
                                    </tr>
                                    <tr>
                                        {
                                            client?.organizations?.length ?
                                            <th colSpan={9} className="sub-title">{client?.organizations[0]?.dept_name || ""}</th>
                                            :
                                            null
                                        }
                                    </tr>
                                </thead>                                
                                <tbody>
                                    {
                                        client?.organizations?.length ? 
                                        client?.organizations?.map((item, idx) => {
                                            return  <tr key={idx}>
                                                    { idx === 0 ? 
                                                        <td rowSpan={client.organizations.length}> {client.func_name}</td>
                                                        :
                                                        <></>
                                                    }
                                                    {/* 담당 */}
                                                    <td className="center">{item.cd_nm}</td>
                                                    {/* 담당상세 */}
                                                    <td className="center">{item.charge_detail}</td>
                                                    {/* 이름 */}
                                                    <td className="center">{item.user_name}</td>
                                                    {/* 직위 */}
                                                    <td className="center">{item.duty_name}</td>
                                                    {/* 소속 */}
                                                    <td className="center">{item.dept_name}</td>                                                            
                                                    {/* 핸드폰 */}
                                                    <td className="center">{item.cell}</td>                                                            
                                                    {/* 전화 */}
                                                    <td className="center">{item.tel}</td>                                                            
                                                    {/* 이메일 */}
                                                    <td className="left">{item.email}</td>                                                            
                                                </tr>
                                            })   
                                            :   
                                            null
                                            
                                        }
                                </tbody>
                                <thead className="fixed" style={{top:'40px'}}>
                                    <tr>
                                        {/* TODO: 직원표시 범례 추가 */}
                                        <th colSpan={9} className="sub-title">(주)하이테크엔지니어링</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    hitech.map((arr, arrIdx) => {
                                        return arr.organizations.map((item, idx) => {
                                            return  <tr key={idx}>
                                                { idx === 0 ? 
                                                    <td rowSpan={arr.organizations.length}> {arr.func_name}</td>
                                                    :
                                                    null
                                                }

                                                    {/* 담당 */}
                                                    <td className="center" style={item.is_use === 'N' ? {color : "lightgray"} : {}}>{item.cd_nm}</td>
                                                    {/* 담당상세 */}
                                                    <td className="center" style={item.is_use === 'N' ? {color : "lightgray"} : {}}>{item.charge_detail}</td>
                                                    {/* 이름 */}
                                                    <td 
                                                        className="center" 
                                                        style={ item.is_use === 'N' ? 
                                                                    {color: "lightgray"} // 퇴사자  
                                                                :  
                                                                    item.co_id === null  ? {} // 외부직원 
                                                                    : 
                                                                    item.co_id === '1' ?  
                                                                        {fontWeight: "bold"} // 내부직원
                                                                        : 
                                                                        {backgroundColor: "beige"} // 협력사
                                                                }>
                                                            {item.user_name}
                                                    </td>
                                                    {/* 직위 */}
                                                    <td className="center" style={item.is_use === 'N' ? {color : "lightgray"} : {}}>{item.duty_name}</td>
                                                    {/* 소속 */}
                                                    <td className="center" style={item.is_use === 'N' ? {color : "lightgray"} : {}}>{item.dept_name}</td>                                                            
                                                    {/* 핸드폰 */}
                                                    <td className="center" style={item.is_use === 'N' ? {color : "lightgray"} : {}}>{item.cell}</td>                                                            
                                                    {/* 전화 */}
                                                    <td className="center" style={item.is_use === 'N' ? {color : "lightgray"} : {}}>{item.tel}</td>                                                            
                                                    {/* 이메일 */}
                                                    <td className="left" style={item.is_use === 'N' ? {color : "lightgray"} : {}}>{item.email}</td>  
                                            </tr>
                                            })
                                            
                                        }) 
                                        
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                : 
                <></>
            }
    </>
}

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
    zIndex: '9999'
};
  
const modalStyle = {
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '1300px',
    width: '95%',
    maxHeight: '650px',
    height: '90%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '10px',
};

const tableStyle = {
    margin: '15px 0px',
    height: "calc(100% - 60px)",
    overflow: "scroll",
};

export default OrganizationModal