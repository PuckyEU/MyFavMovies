import Layout from "./Layout";
import {UserAuth} from "../context/AuthContext";
import {useHistory} from "react-router-dom";

export default function Account() {
    const {user} = UserAuth();
    const history = useHistory();

    document.onmousedown = () => {
        return true;
    };

    function settings() {
        history.push('/settings')
    }

    return (
        <Layout>
            <div className="flex h-screen">
                <div className="w-1/4 h-full border-r-2 border-r-black flex profile_overview text-xs sm:text-xs md:text-2xl lg:text-4xl">
                    <div className="fixed m-2 w-[5px] sm:w-[15px] md:w-[25px] lg:w-[30px]">
                        <img src={"https://cdn-icons-png.flaticon.com/512/3524/3524659.png"} alt="Settings" className="" onClick={settings}/>
                    </div>
                    <div className="flex justify-center">
                        <div className="h-fit aspect-square w-3/5 mt-5 text-justify flex items-center justify-center rounded-full bg-gradient-to-r p-1 from-[#FF512F] to-[#F09819]">
                            <div className="w-full h-full text-justify flex items-center justify-center rounded-full overflow-hidden">
                                <img src={"https://cdn-icons-png.flaticon.com/512/456/456212.png"} alt="PFP" className="p-10"/>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 w-full">{user ? user.displayName : 'Username'}</div>
                </div>
                <div className="w-3/4 h-full">

                </div>
            </div>
        </Layout>
    )
}