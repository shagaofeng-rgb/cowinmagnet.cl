import { adminAccountStorageMode, getConfiguredAdminEmail } from "@/lib/adminAccountStore";

const t = {
  title: "\u7528\u6237\u4e0e\u6743\u9650",
  heading: "\u7ba1\u7406\u5458\u8d26\u53f7\u548c\u89d2\u8272\u6743\u9650",
  desc: "\u540e\u53f0\u9875\u9762\u548c API \u5747\u901a\u8fc7\u670d\u52a1\u7aef\u4f1a\u8bdd\u6821\u9a8c\u3002",
  currentAdmin: "\u5f53\u524d\u7ba1\u7406\u5458",
  email: "\u8d26\u53f7\u90ae\u7bb1",
  storage: "\u8d26\u53f7\u5b58\u50a8",
  password: "\u5bc6\u7801\u4f7f\u7528\u5b89\u5168\u54c8\u5e0c\u5b58\u50a8\uff0c\u6e90\u7801\u4e0d\u4fdd\u5b58\u660e\u6587\u5bc6\u7801\u3002",
  permissionModel: "\u6743\u9650\u6a21\u578b",
  permissionText: "\u89d2\u8272\u6743\u9650\u7528\u4e8e\u5bf9\u540e\u53f0\u6a21\u5757\u8fdb\u884c\u67e5\u770b\u3001\u7f16\u8f91\u3001\u53d1\u5e03\u3001\u5bfc\u51fa\u548c\u540c\u6b65\u63a7\u5236\u3002",
  role: "\u89d2\u8272",
  note: "\u6743\u9650\u8bf4\u660e"
};

const roles = [
  ["\u8d85\u7ea7\u7ba1\u7406\u5458", "\u5168\u90e8\u6a21\u5757\u7ba1\u7406\u6743\u9650"],
  ["\u7ba1\u7406\u5458", "\u5185\u5bb9\u3001\u8be2\u76d8\u3001\u6570\u636e\u548c\u8bbe\u7f6e\u7ba1\u7406"],
  ["\u5185\u5bb9\u7f16\u8f91", "\u4ea7\u54c1\u548c\u65b0\u95fb\u5185\u5bb9\u7ef4\u62a4"],
  ["\u5e02\u573a\u4eba\u5458", "\u65b0\u95fb\u3001SEO \u548c\u8bbf\u95ee\u6570\u636e\u67e5\u770b"],
  ["\u9500\u552e\u4eba\u5458", "\u5ba2\u6237\u8868\u5355\u548c\u8be2\u76d8\u8ddf\u8fdb"],
  ["\u6570\u636e\u5206\u6790\u4eba\u5458", "\u8bbf\u95ee\u5206\u6790\u548c SEO \u6570\u636e\u67e5\u770b"],
  ["\u53ea\u8bfb\u7528\u6237", "\u53ea\u8bfb\u67e5\u770b"]
];

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.title} | Cowinmagnet.cl` };

export default function AdminUsersPage() {
  return (
    <section className="admin-panel">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">{t.title}</p>
          <h1>{t.heading}</h1>
          <p>{t.desc}</p>
        </div>
      </div>
      <section className="admin-grid two">
        <article className="admin-panel">
          <h2>{t.currentAdmin}</h2>
          <p>{t.email}: {getConfiguredAdminEmail()}</p>
          <p>{t.storage}: {adminAccountStorageMode()}</p>
          <p>{t.password}</p>
        </article>
        <article className="admin-panel">
          <h2>{t.permissionModel}</h2>
          <p>{t.permissionText}</p>
        </article>
      </section>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>{t.role}</th><th>{t.note}</th></tr></thead>
          <tbody>{roles.map(([name, note]) => <tr key={name}><td>{name}</td><td>{note}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
