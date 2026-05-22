
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import "../styles/CertificateView.css";
import { API_URL } from "../api";
import visionLogo from "../vision2030_logo_transparent.png";
import accessIcon from "../accessibility_person_only.png";

const CertificateView = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/certificates/${id}`);
        setCertificate(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.certificate-view-container');
      if (container) {
        if (window.scrollY > 40) {
          container.classList.add('scrolled-mode');
        } else {
          container.classList.remove('scrolled-mode');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!certificate) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>جاري تحميل الشهادة...</p>
      </div>
    );
  }

  if (certificate.isLocked) {
    return (
      <>
        <Header />
        <div className="certificate-view-container">
          <div className="certificate-view-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>الشهادة مقفولة</h2>
            <p style={{ fontSize: '18px', color: '#555', lineHeight: '1.6' }}>
              عذراً، هذه الشهادة غير متاحة للعرض حالياً.<br />
              يرجى التواصل مع المسؤول للحصول على مزيد من المعلومات.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="certificate-view-container">
        <div className="certificate-view-card">

          <div className="certificate-view-title-group">
            <h2 className="certificate-view-title-ar">
              شهادة صحية للأنشطة التجارية
            </h2>
          </div>

          <div className="certificate-content-wrapper">
            <div className="certificate-view-photo-container">
              {certificate.photoUrl ? (
                <img
                  src={certificate.photoUrl}
                  alt="Photo"
                  className="certificate-view-photo"
                />
              ) : (
                <div className="photo-placeholder">لا توجد صورة</div>
              )}
            </div>

            <div className="certificate-view-info-grid">
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">الأمانة</span>
                <input className="input-box" type="text" value={certificate.amana || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">البلدية</span>
                <input className="input-box" type="text" value={certificate.baladiya || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">الإسم</span>
                <input className="input-box" type="text" value={certificate.name || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">رقم الهوية</span>
                <input className="input-box" type="text" value={certificate.nationalId || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">الجنس</span>
                <input className="input-box" type="text" value={certificate.gender || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">الجنسية</span>
                <input className="input-box" type="text" value={certificate.nationality || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">رقم الشهادة الصحية</span>
                <input className="input-box" type="text" value={certificate.healthCertificateNumber || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">المهنة</span>
                <input className="input-box" type="text" value={certificate.job || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">تاريخ إصدار الشهادة الصحية هجري</span>
                <input className="input-box" type="text" value={certificate.healthCertIssueDateHijri || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">تاريخ إصدار الشهادة الصحية ميلادي</span>
                <input className="input-box" type="text" value={certificate.healthCertIssueDate ? new Date(certificate.healthCertIssueDate).toISOString().split('T')[0].replace(/-/g, '/') : ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">تاريخ نهاية الشهادة الصحية هجري</span>
                <input className="input-box" type="text" value={certificate.healthCertExpiryDateHijri || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">تاريخ نهاية الشهادة الصحية ميلادي</span>
                <input className="input-box" type="text" value={certificate.healthCertExpiryDate ? new Date(certificate.healthCertExpiryDate).toISOString().split('T')[0].replace(/-/g, '/') : ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">نوع البرنامج التثقيفي</span>
                <input className="input-box" type="text" value={certificate.educationalProgram || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">تاريخ إنتهاء البرنامج التثقيفي</span>
                <input className="input-box" type="text" value={certificate.educationalProgramEndDate ? new Date(certificate.educationalProgramEndDate).toISOString().split('T')[0].replace(/-/g, '/') : ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">رقم الرخصة</span>
                <input className="input-box" type="text" value={certificate.licenseNumber || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">إسم المنشأة</span>
                <input className="input-box" type="text" value={certificate.establishmentName || ''} readOnly />
              </div>
              <div className="certificate-view-info-row">
                <span className="certificate-view-label">رقم المنشأة</span>
                <input className="input-box" type="text" value={certificate.establishmentNumber || ''} readOnly />
              </div>
              <div className="certificate-view-info-row" style={{ visibility: 'hidden' }}>
                <span className="certificate-view-label">فارغ</span>
                <input className="input-box" type="text" value="" readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Main Footer - Dark Green with Final Layout */}
      <footer className="main-footer">
        <div className="footer-content">
          {/* Right Section - Links and Copyright Stacked in RTL */}
          <div className="footer-right-section">
            <div className="footer-links-row">
              <div className="footer-links">
                <a href="#">خريطة الموقع</a>
                <span className="separator">|</span>
                <a href="#">RSS</a>
                <span className="separator">|</span>
                <a href="#">شروط الاستخدام</a>
              </div>
            </div>

            <div className="footer-copyright">
              <p>جميع الحقوق محفوظة لوزارة البلديات والإسكان © 2026</p>
              <p className="footer-subtitle">تم تطويره وصيانته بواسطة وزارة البلديات والإسكان</p>
            </div>
          </div>

          {/* Left Section - Bottom Logos (RTL: rightmost = first) */}
          <div className="footer-left-section">
            <a href="https://balady.gov.sa" target="_blank" rel="noopener noreferrer" className="balady-branding-link">
              <img src="/footer_palm_icon.png" alt="Balady Palm" className="balady-footer-palm" />
              <span className="balady-text-stamp">balady</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default CertificateView;
