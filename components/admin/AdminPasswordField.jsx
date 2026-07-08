"use client";

import { useState } from "react";

export default function AdminPasswordField() {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      密码
      <span className="password-row">
        <input name="password" type={visible ? "text" : "password"} autoComplete="current-password" required />
        <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "隐藏密码" : "显示密码"}>
          {visible ? "隐藏" : "显示"}
        </button>
      </span>
    </label>
  );
}
