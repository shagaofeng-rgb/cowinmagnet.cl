const sections = [
  { title: "账户安全", text: "管理员可在账户安全中维护登录凭据，并按企业内部流程分配后台访问权限。" },
  { title: "客户通知", text: "新的客户表单会同步发送至指定业务邮箱，销售团队可据此跟进。" },
  { title: "数据展示", text: "后台仅展示当前筛选范围内的经营数据、客户线索和内容状态。" },
  { title: "网站状态", text: "当网站数据或搜索表现需要关注时，系统会在对应业务页面提供提示。" }
];

export const dynamic = "force-dynamic";
export const metadata = { title: "后台设置 | Cowinmagnet.cl" };

export default function AdminSettingsPage() {
  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">后台设置</p>
          <h1>账户与运营设置</h1>
          <p>集中查看与日常运营相关的设置说明。</p>
        </div>
      </div>
      <section className="admin-grid two">
        {sections.map((section) => <article className="admin-panel" key={section.title}><h2>{section.title}</h2><p>{section.text}</p></article>)}
      </section>
    </section>
  );
}
