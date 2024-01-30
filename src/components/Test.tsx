import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  IStudentDetail,
  IClassAssignment,
  IStudentGrade,
} from "../types/api_types";
import { v4 as uuidv4 } from "uuid";

interface TestProps {
  studentDetails: IStudentDetail[];
  classTitleId: string[];
  classAssignments: IClassAssignment[];
  studentGrades: IStudentGrade[];
}

const columns: GridColDef[] = [
  {
    field: "studentID",
    headerName: "Student ID",
  },
  {
    field: "studentName",
    headerName: "Student Name",
    width: 150,
  },
  {
    field: "classID",
    headerName: "Class ID",
  },
  {
    field: "className",
    headerName: "Class Name",
  },
  {
    field: "semester",
    headerName: "Semester",
  },
  {
    field: "finalGrade",
    headerName: "Final Grade",
  },
];

export const Test = ({
  studentGrades,
  studentDetails,
  classTitleId,
  classAssignments,
}: TestProps) => {
  const classTitle = classTitleId[0];
  const classId = classTitleId[1];
  const rows = studentDetails.map((student, index) => {
    if (Array.isArray(student)) {
      const s = student[0];
      const studentId = s.universityId;

      const currStudentGrade = studentGrades.filter(
        (s) => s.studentId === studentId
      );
      if (Array.isArray(currStudentGrade)) {
        const s = currStudentGrade[0];
        const unweightedGrade = s.grades[0];
        const unweightedGradeKeys = Object.keys(unweightedGrade);
        let weightedGrade = 0;

        unweightedGradeKeys.forEach((a) => {
          const ass = classAssignments.find(
            (assignment) => assignment.assignmentId === a
          );
          if (ass) {
            const assignmentWeight = ass.weight;
            const gradeValue = parseFloat(unweightedGrade[a]);
            weightedGrade += assignmentWeight * gradeValue;
          }
        });

        weightedGrade /= 100;
        return {
          id: uuidv4(),
          studentID: studentId,
          studentName: s.name,
          classID: classId,
          className: classTitle,
          semester: "fall2022",
          finalGrade: weightedGrade,
        };
      }
    }
  });
  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} pageSize={10} />
    </Box>
  );
};
