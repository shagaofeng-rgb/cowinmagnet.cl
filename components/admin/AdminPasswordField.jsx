"use client";

import { useState } from "react";

export default function AdminPasswordField() {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      Password
      <span className="password-row">
        <input name="password" type={visible ? "text" : "password"} required />
        <button type="button" onClick={() => setVisible((value) => !value)}>
          {visible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}
