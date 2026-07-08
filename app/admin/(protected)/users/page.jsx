import { adminAccountStorageMode, getConfiguredAdminEmail } from "@/lib/adminAccountStore";

export const dynamic = "force-dynamic";
export const metadata = { title: "用户与权限 | Cowinmagnet.cl 后台" };

const roles = [
  ["超级管理员", "全部模块查看、编辑、发布、导出、同步和系统设置权限"],
  ["管理员", "内容、询盘、数据和设置管理权限"],
  ["内容编辑", "产品和新闻内容新增、编辑、保存草稿权限"],
  ["市场人员", "新闻、SEO、访问分析和数据同步查看权限"],
  ["销售人员", "客户表单、询盘跟进和导出权限"],
  ["数据分析人员", "访问分析、SEO 数据和同步日志查看权限"],
  ["只读用户", "只读查看权限"]
];

export default function AdminUsersPage() {
  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">用户与权限</p>
          <h1>管理员账号和角色权限</h1>
          <p>当前版本使用服务端会话和管理员账号存储。页面和 API 均会做后台登录校验。</p>
        </div>
      </div>
      <section className="admin-grid two">
        <article className="admin-panel">
          <h2>当前管理员</h2>
          <p>账号邮箱：{getConfiguredAdminEmail()}</p>
          <p>账号存储：{adminAccountStorageMode()}</p>
          <p>密码修改：请在后台账号接口或环境变量中更新，源码不保存明文密码。</p>
        </article>
        <article className="admin-panel">
          <h2>权限模型</h2>
          <p>已预留角色模型。下一阶段可扩展为数据库中的 User、Role、Permission、UserRole 表。</p>
        </article>
      </section>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>角色</th><th>权限说明</th></tr></thead>
          <tbody>{roles.map(([name, note]) => <tr key={name}><td>{name}</td><td>{note}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
