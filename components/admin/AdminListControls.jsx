"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminListControls({ searchLabel = "搜索标题、分类或编号", statusOptions = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");

  function update(values) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form className="admin-list-controls" onSubmit={(event) => { event.preventDefault(); update({ query }); }}>
      <label className="admin-search-control">搜索
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchLabel} />
      </label>
      {statusOptions.length ? <label>状态
        <select value={searchParams.get("status") || ""} onChange={(event) => update({ status: event.target.value })}>
          <option value="">全部状态</option>
          {statusOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
        </select>
      </label> : null}
      <label>每页
        <select value={searchParams.get("pageSize") || "25"} onChange={(event) => update({ pageSize: event.target.value })}>
          <option value="25">25 条</option><option value="50">50 条</option><option value="100">100 条</option>
        </select>
      </label>
      <button type="submit">查询</button>
      <button type="button" className="admin-control-reset" onClick={() => { setQuery(""); update({ query: "", status: "", pageSize: "25" }); }}>重置</button>
    </form>
  );
}

export function AdminListPagination({ meta = {}, itemLabel = "条记录", pageParam = "page" }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(meta.page || 1);
  const totalPages = Number(meta.totalPages || 1);
  function move(nextPage) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageParam, String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }
  return <div className="admin-pagination"><span>共 {Number(meta.total || 0).toLocaleString()} {itemLabel} · 第 {page}/{totalPages} 页</span><div><button type="button" disabled={page <= 1} onClick={() => move(page - 1)}>上一页</button><button type="button" disabled={page >= totalPages} onClick={() => move(page + 1)}>下一页</button></div></div>;
}
