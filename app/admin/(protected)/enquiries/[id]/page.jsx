import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/adminAuth";
import { getEnquiryById } from "@/lib/enquiryStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "询盘详情 | Cowinmagnet.cl" };
const labels = {
  name: "联系人", company: "公司", country: "国家", region: "地区", email: "电子邮箱", whatsapp: "电话 / WhatsApp", language: "沟通语言",
  model: "型号", product: "所询产品", industry: "行业", material: "物料", capacity: "产量", beltWidth: "带宽",
  beltSpeed: "带速", layerThickness: "料层厚度", suspensionHeight: "悬挂高度", installation: "安装方式", cleaning: "清理方式",
  altitude: "海拔", temperature: "温度", voltage: "电压", frequency: "频率", phases: "相数", sourcePage: "来源页面"
};

export default async function EnquiryDetail({ params }) {
  await requireAdminSession();
  const { id } = await params;
  const inquiry = await getEnquiryById(id);
  if (!inquiry) notFound();
  const state = { delivered: "已发送", failed: "发送失败", not_configured: "待接通", processing: "发送中" }[inquiry.notification?.status] || "待发送";
  return <>
    <section className="admin-page-head"><div>
      <Link className="admin-detail-link" href="/admin/enquiries">返回询盘列表</Link>
      <h1>询盘详情</h1><p>{inquiry.id} · 邮件通知：{state}</p>
    </div></section>
    <section className="admin-panel">
      <h2>客户与项目</h2>
      <dl className="admin-inquiry-facts">{Object.entries(labels).filter(([key]) => inquiry[key]).map(([key, label]) =>
        <div key={key}><dt>{label}</dt><dd>{String(inquiry[key])}</dd></div>)}</dl>
      <h3>项目说明</h3><p className="admin-inquiry-note">{inquiry.projectDescription || inquiry.message || "未填写"}</p>
      {inquiry.visitorId ? <Link className="admin-detail-link" href={"/admin/visitors/" + encodeURIComponent(inquiry.visitorId)}>查看访客路径</Link> : null}
    </section>
  </>;
}
