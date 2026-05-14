"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, Edit } from "lucide-react";
import { format } from "date-fns";
import { adminAuthFetch } from "@/lib/admin-api";

// Matches V4 API Contract Response for GET /api/admin/courses
type Course = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "DISABLED";
  isNcvet: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    name: string;
  };
};

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetching up to 100 courses for client-side table handling. 
        // For massive datasets, you'd wire up React Table's server-side manual pagination.
        const res = await adminAuthFetch("/admin/courses?limit=100");
        if (!res.ok) throw new Error("Failed to fetch courses");

        const json = await res.json();
        if (json.success) {
          setCourses(json.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "id",
      header: "Course ID",
      cell: ({ row }) => <span className="font-mono text-xs text-admin-muted-foreground">{row.getValue<string>("id").substring(0, 8)}...</span>
    },
    {
      accessorKey: "title",
      header: "Course Title",
      cell: ({ row }) => <span className="font-semibold text-admin-fg">{row.getValue("title")}</span>
    },
    {
      accessorKey: "isNcvet",
      header: "Type",
      cell: ({ row }) => {
        const isNcvet = row.getValue("isNcvet");
        return (
          <span className={isNcvet ? "badge-admin-accent" : "badge-muted"}>
            {isNcvet ? "NCVET Certified" : "Standard"}
          </span>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        if (status === "PUBLISHED") return <span className="badge-success">Published</span>;
        if (status === "DRAFT") return <span className="badge-muted">Draft</span>;
        return <span className="badge-error">Disabled</span>;
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ row }) => (
        <span className="text-admin-muted-foreground text-sm">
          {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
        </span>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => router.push(`/admin/courses/${row.original.id}`)}
            className="p-1.5 text-admin-muted-foreground hover:text-admin-primary hover:bg-admin-primary/10 rounded transition-colors"
            title="Edit Course"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-admin-muted-foreground hover:text-admin-fg hover:bg-admin-muted/10 rounded transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-fg">Courses</h1>
        <p className="text-sm mt-1 text-admin-muted-foreground">Manage training courses, enrollments, and configurations.</p>
      </div>

      <DataTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Search courses by title..."
        title="All Courses"
        description={`${courses.length} courses total`}
        actions={
          <button
            onClick={() => router.push('/admin/courses/create')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-admin-primary text-white hover:bg-admin-primary-hover active:scale-95 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Create Course
          </button>
        }
      />
    </div>
  );
}