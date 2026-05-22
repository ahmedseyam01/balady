import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { API_URL } from "../api";

function Dashboard() {
  const [certificates, setCertificates] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState("");
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // لو مفيش توكن → نرجّعه على اللوجين
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchCertificates();
  }, []);

  // دالة تجيب الشهادات
  const fetchCertificates = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/certificates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCertificates(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الشهادة؟")) return;
    try {
      await axios.delete(`${API_URL}/api/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("تم حذف الشهادة بنجاح");
      fetchCertificates();
    } catch (err) {
      console.log(err);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleToggleLock = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axios.put(
        `${API_URL}/api/certificates/${id}`,
        { isLocked: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCertificates(prevDocs =>
        prevDocs.map(doc =>
          doc._id === id ? { ...doc, isLocked: newStatus } : doc
        )
      );
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تحديث حالة القفل");
    }
  };
  
  const handleDownloadSingle = async (cert) => {
    const filename = `شهادة ${cert.name} - ${new Date().toISOString().slice(0, 10)}.json`;
    // ✅ لازم نلف الشهادة في مصفوفة [ ] عشان عملية الاستيراد تقبلها
    const jsonText = JSON.stringify([cert], null, 2);

    if (window.showSaveFilePicker) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "ملف JSON", accept: { "application/json": [".json"] } }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(jsonText);
        await writable.close();
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      }
    } else {
      const url = window.URL.createObjectURL(new Blob([jsonText], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    setBackupMsg("");
    try {
      const res = await axios.get(`${API_URL}/api/certificates-backup`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const filename = `نسخة احتياطية ${dateStr} ${hours}-${minutes}.json`;
      const jsonText = await res.data.text();

      // ✅ لو المتصفح بيدعم File System Access API (Chrome / Edge)
      if (window.showSaveFilePicker) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "ملف JSON",
                accept: { "application/json": [".json"] },
              },
            ],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(jsonText);
          await writable.close();
          setBackupMsg("✅ تم الحفظ في المكان المحدد!");
        } catch (pickerErr) {
          // المستخدم ضغط إلغاء
          if (pickerErr.name === "AbortError") {
            setBackupMsg("");
            return;
          }
          throw pickerErr;
        }
      } else {
        // 🔄 Fallback للمتصفحات القديمة (Firefox / Safari) → Downloads العادي
        const url = window.URL.createObjectURL(new Blob([jsonText], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setBackupMsg("✅ تم التحميل في مجلد Downloads!");
      }
    } catch (err) {
      console.error(err);
      setBackupMsg("❌ حدث خطأ");
    } finally {
      setBackupLoading(false);
      setTimeout(() => setBackupMsg(""), 4000);
    }
  };

  const handleRestoreClick = () => {
    document.getElementById("restore-file-input").click();
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // reset input so same file can be selected again
    e.target.value = "";

    if (!window.confirm(`هل أنت متأكد من استيراد البيانات من الملف: "${file.name}"؟\nالبيانات الموجودة ستُحدَّث والجديدة ستُضاف.`)) return;

    setRestoreLoading(true);
    setRestoreMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API_URL}/api/certificates-restore`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setRestoreMsg(`✅ ${res.data.message}`);
      fetchCertificates(); // تحديث القائمة
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "حدث خطأ أثناء الاستيراد";
      setRestoreMsg(`❌ ${msg}`);
    } finally {
      setRestoreLoading(false);
      setTimeout(() => setRestoreMsg(""), 6000);
    }
  };

  return (
    <div className="dashboard-container">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="dashboard-header">
        <h2>لوحة التحكم</h2>

        <button onClick={() => navigate("/add-certificate")} className="dashboard-add-btn">
          + إضافة شهادة
        </button>

        {/* زرار النسخة الاحتياطية */}
        <button
          onClick={handleBackup}
          disabled={backupLoading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 18px",
            background: backupLoading
              ? "#94a3b8"
              : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: backupLoading ? "not-allowed" : "pointer",
            boxShadow: backupLoading ? "none" : "0 4px 12px rgba(59,130,246,0.4)",
            transition: "all 0.2s ease",
            marginLeft: "8px",
          }}
          onMouseEnter={(e) => {
            if (!backupLoading) e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
          title="تحميل نسخة احتياطية من كل الشهادات"
        >
          {backupLoading ? (
            <>
              <span
                style={{
                  width: "13px",
                  height: "13px",
                  border: "2px solid #fff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              جاري...
            </>
          ) : (
            <>💾 نسخة احتياطية</>
          )}
        </button>

        {backupMsg && (
          <span
            style={{
              marginLeft: "10px",
              fontSize: "13px",
              fontWeight: "600",
              color: backupMsg.startsWith("✅") ? "#16a34a" : "#dc2626",
            }}
          >
            {backupMsg}
          </span>
        )}

        {/* زرار الاستيراد / Restore */}
        <input
          id="restore-file-input"
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleRestoreFile}
        />
        <button
          onClick={handleRestoreClick}
          disabled={restoreLoading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 18px",
            background: restoreLoading
              ? "#94a3b8"
              : "linear-gradient(135deg, #15803d, #22c55e)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: restoreLoading ? "not-allowed" : "pointer",
            boxShadow: restoreLoading ? "none" : "0 4px 12px rgba(34,197,94,0.4)",
            transition: "all 0.2s ease",
            marginLeft: "8px",
          }}
          onMouseEnter={(e) => {
            if (!restoreLoading) e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
          title="استيراد نسخة احتياطية من ملف JSON"
        >
          {restoreLoading ? (
            <>
              <span
                style={{
                  width: "13px",
                  height: "13px",
                  border: "2px solid #fff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              جاري الاستيراد...
            </>
          ) : (
            <>📂 استيراد نسخة احتياطية</>
          )}
        </button>

        {restoreMsg && (
          <span
            style={{
              marginLeft: "10px",
              fontSize: "13px",
              fontWeight: "600",
              color: restoreMsg.startsWith("✅") ? "#16a34a" : "#dc2626",
            }}
          >
            {restoreMsg}
          </span>
        )}

        <button onClick={logout} className="dashboard-logout-btn">
          تسجيل خروج
        </button>
      </div>

      <div className="dashboard-list">
        {certificates.length === 0 ? (
          <p className="dashboard-empty">لا توجد شهادات حتى الآن.</p>
        ) : (
          certificates.map((c) => (
            <div key={c._id} className="dashboard-card">
              <div className="dashboard-card-header">
                {c.photoUrl ? (
                  <img
                    src={c.photoUrl.startsWith("http") ? c.photoUrl : `${API_URL}/${c.photoUrl}`}
                    alt={c.name}
                    className="dashboard-card-photo"
                  />
                ) : (
                  <div className="dashboard-card-photo-placeholder">
                    {c.name.charAt(0)}
                  </div>
                )}
                <h3>{c.name}</h3>
              </div>
              <p><span className="dashboard-card-strong">رقم الهوية:</span> {c.nationalId}</p>
              <p><span className="dashboard-card-strong">الجنسية:</span> {c.nationality}</p>
              <div className="dashboard-btn-group">
                <button
                  className="dashboard-view-btn"
                  onClick={() => navigate(`/certificate/${c._id}`)}
                  title="عرض"
                >
                  👁️
                </button>
                <button
                  className="dashboard-edit-btn"
                  onClick={() => navigate(`/edit-certificate/${c._id}`)}
                  title="تعديل"
                >
                  ✏️
                </button>
                <button
                  className="dashboard-delete-btn"
                  onClick={() => handleDelete(c._id)}
                  title="حذف"
                >
                  🗑️
                </button>
                <button
                  onClick={() => handleDownloadSingle(c)}
                  style={{
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                    marginLeft: "5px",
                  }}
                  title="تحميل بيانات الشهادة JSON"
                >
                  📥 جيسون
                </button>
                <button
                  onClick={() => handleToggleLock(c._id, c.isLocked)}
                  style={{
                    backgroundColor: c.isLocked ? "#d32f2f" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                    marginLeft: "5px",
                  }}
                  title={c.isLocked ? "فتح الشهادة" : "قفل الشهادة"}
                >
                  {c.isLocked ? "🔒 مقفل" : "🔓 مفتوح"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
