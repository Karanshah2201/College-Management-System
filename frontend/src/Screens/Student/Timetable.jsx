import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useSelector } from "react-redux";
import { MdCalendarMonth, MdCloudDownload, MdInfo, MdOpenInNew, MdZoomOutMap } from "react-icons/md";
import axiosWrapper from "../../utils/AxiosWrapper";
import { toast } from "react-hot-toast";
import Heading from "../../components/Heading";

const Timetable = () => {
  const [timetable, setTimetable] = useState("");
  const userData = useSelector((state) => state.userData);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const getTimetable = async () => {
      setDataLoading(true);
      try {
        const response = await axiosWrapper.get(`/timetable?semester=${userData.semester}&branch=${userData.branchId?._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
        });
        if (response.data.success && response.data.data.length > 0) setTimetable(response.data.data[0].link);
        else setTimetable("");
      } catch { setTimetable(""); }
      finally { setDataLoading(false); }
    };
    if (userData?.branchId) getTimetable();
  }, [userData]);

  return (
    <div className="w-full space-y-8 anim-fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
        <Heading 
          title="Temporal Blueprint" 
          subtitle={`Current schedule synchronized for Semester ${userData.semester} / Unit ${userData.branchId?.branchId}`} 
        />
        {!dataLoading && timetable && (
          <button 
            onClick={() => window.open(process.env.REACT_APP_MEDIA_LINK + "/" + timetable)}
            className="group bg-[var(--navy)] text-white px-8 py-3.5 rounded-2xl font-black text-xs tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
          >
            <MdCloudDownload size={18} /> DOWNLOAD ASSET
          </button>
        )}
      </div>

      {dataLoading ? (
        <div className="flex justify-center py-40">
           <div className="animate-spin w-10 h-10 border-4 border-[var(--navy)] border-t-transparent rounded-full" />
        </div>
      ) : timetable ? (
        <div className="bento-card p-4 bg-gray-50/50 group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-2">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[var(--navy)] flex items-center justify-center"><MdCalendarMonth size={18} /></div>
                <span className="text-[0.65rem] font-black text-[var(--navy-dark)] uppercase tracking-widest">Global Schedule Projection</span>
             </div>
             <div className="flex gap-2">
                <button onClick={() => window.open(process.env.REACT_APP_MEDIA_LINK + "/" + timetable)} className="p-2 bg-white rounded-lg text-gray-400 hover:text-[var(--navy)] shadow-sm border border-gray-100 transition-all"><MdOpenInNew size={16} /></button>
             </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white group/img">
            <img
              className="w-full h-auto object-contain min-h-[400px]"
              src={process.env.REACT_APP_MEDIA_LINK + "/" + timetable}
              alt="timetable"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
               <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-[0.6rem] font-bold uppercase tracking-widest flex items-center gap-2">
                  <MdZoomOutMap /> Click Download To View Full Scale
               </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
             <MdInfo className="text-blue-400 mt-0.5 shrink-0" size={18} />
             <p className="text-[0.65rem] font-bold text-blue-600 leading-relaxed uppercase tracking-widest">This artifact represents the most recent version of your academic schedule. Changes in room allocations or session intervals will be synchronized in real-time.</p>
          </div>
        </div>
      ) : (
        <div className="bento-card p-20 text-center flex flex-col items-center">
          <MdCalendarMonth size={64} className="text-gray-100 mb-4" />
          <p className="text-gray-400 font-medium italic">Temporal blueprint currently pending formulation</p>
          <div className="mt-6 bento-badge bento-badge-info !text-[0.6rem] uppercase font-black">Contact Registry for Inquiries</div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
