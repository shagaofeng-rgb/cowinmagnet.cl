export const dynamic = "force-dynamic";
export const metadata = { title: "账户安全 | Cowinmagnet.cl" };

export default function AdminUsersPage() {
  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">账户安全</p>
          <h1>后台访问管理</h1>
          <p>后台访问仅向获授权的企业人员开放。请通过账户安全流程维护登录信息和访问权限。</p>
        </div>
      </div>
      <section className="admin-grid two">
        <article className="admin-panel"><h2>登录保护</h2><p>后台页面和业务接口均要求有效登录状态，登录失败会受到访问频率保护。</p></article>
        <article className="admin-panel"><h2>密码维护</h2><p>如需更新密码，请使用登录页的“忘记密码”流程，由获授权人员完成验证后操作。</p></article>
      </section>
    </section>
  );
}
