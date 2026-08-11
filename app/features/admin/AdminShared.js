"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "../../page.module.css";

export function AdminPagination({ pagination, onPageChange, dark = false }) {
  if (!pagination || pagination.totalElements === 0) return null;

  const currentPage = pagination.page + 1;
  const totalPages = Math.max(1, pagination.totalPages);

  return (
    <div className={`${styles.adminPagination} ${dark ? styles.adminPaginationDark : ""}`}>
      <span>전체 {pagination.totalElements}건</span>
      <div>
        <button type="button" onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page === 0} aria-label="이전 페이지" title="이전 페이지">
          <ArrowLeft size={15} />
        </button>
        <strong>{currentPage} / {totalPages}</strong>
        <button type="button" onClick={() => onPageChange(pagination.page + 1)} disabled={currentPage >= totalPages} aria-label="다음 페이지" title="다음 페이지">
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
