// async and await were created partially with the help of GPT4. As well as some of the error checkings

import { useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { MenuItem, Select, Typography } from "@mui/material";
/**
 * You will find globals from this file useful!
 */
import { MY_BU_ID, BASE_API_URL, GET_DEFAULT_HEADERS } from "./globals";
import { IUniversityClass,IStudentDetail,IClassAssignment,IStudentGrade } from "./types/api_types";

import { GradeTable } from "./components/GradeTable";

function App() {
  // You will need to use more of these!
  const [currClassId, setCurrClassId] = useState<string>("");
  const [currClassTitle, setCurrClassTitle] = useState<string>("");

  const [classTitlesId, setClassTitlesId] = useState<
    { classId: string; title: string }[]
  >([]);
  const [studentList, setStudentList] = useState<IStudentDetail[]>([]);
  const [classAssignmentList, setClassAssignmentList] = useState<IClassAssignment[]>([]);
  const [grade, setGrade] = useState<IStudentGrade[]>([]);


  /**
   * This is JUST an example of how you might fetch some data(with a different API).
   * As you might notice, this does not show up in your console right now.
   * This is because the function isn't called by anything!
   *
   * You will need to lookup how to fetch data from an API using React.js
   * Something you might want to look at is the useEffect hook.
   *
   * The useEffect hook will be useful for populating the data in the dropdown box.
   * You will want to make sure that the effect is only called once at component mount.
   *
   * You will also need to explore the use of async/await.
   *
   */

  const fetchClasses = async () => {
    try {
      const res = await fetch(
        `${BASE_API_URL}/class/listBySemester/fall2022?buid=${MY_BU_ID}`,
        {
          method: "GET",
          headers: GET_DEFAULT_HEADERS(),
        }
      );
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const classes: IUniversityClass[] = await res.json();
      const transformedClasses = classes.map((item) => ({
        classId: item.classId,
        title: item.title,
      }));
      setClassTitlesId(transformedClasses);
    } catch (error) {
      console.error("Failed to fetch class data:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (currClassId) {
      fetchStudentsAndGrades(currClassId);
    }
  }, [currClassId]);

  useEffect(() => {
    (async () => {
      if (currClassId) {
        await fetchAssignments(currClassId);
      }
    })();
  }, [currClassId]);

  const fetchGrades = async (studentId:string, classId:string) => {
    try {
      const res = await fetch(
        `${BASE_API_URL}/student/listGrades/${studentId}/${classId}?buid=${MY_BU_ID}`,
        {
          method: "GET",
          headers: GET_DEFAULT_HEADERS(),
        }
      );
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const grade = await res.json();
      return grade;
    } catch (error) {
      console.error("Failed to fetch student grade:", error);
    }
  };

  const fetchStudentsAndGrades = async (classId: string) => {
    try {
      const response = await fetch(
        `${BASE_API_URL}/class/listStudents/${classId}?buid=${MY_BU_ID}`,
        {
          method: "GET",
          headers: GET_DEFAULT_HEADERS(),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const students = await response.json();
  
      const studentDetailsPromises = students.map(async (studentId: string) => {
        const studentDetails = await fetchStudentDetails(studentId);
        const grades = await fetchGrades(studentId, classId);
  
        return { studentDetails, grades };
      });
  
      const studentsWithGrades = await Promise.all(studentDetailsPromises);
  
      // Separate the student details and grades
      const studentDetailsArray = studentsWithGrades.map((item) => item.studentDetails);
      const gradesArray = studentsWithGrades.map((item) => item.grades);
  
      setStudentList(studentDetailsArray);
      setGrade(gradesArray);
    } catch (error) {
      console.error("Failed to fetch students and their grades:", error);
    }
  };
  const fetchStudentDetails = async (studentId:string) => {
    try {
      const response = await fetch(
        `${BASE_API_URL}/student/GetById/${studentId}?buid=${MY_BU_ID}`,
        {
          method: "GET",
          headers: GET_DEFAULT_HEADERS(),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const studentDetails = await response.json();
      return studentDetails;
    } catch (error) {
      console.error("Failed to fetch student information:", error);
      return null;
    }
  };

  const fetchAssignments = async (classId:string) => {
    try {
      const res = await fetch(
        `${BASE_API_URL}/class/listAssignments/${classId}?buid=${MY_BU_ID}`,
        {
          method: "GET",
          headers: GET_DEFAULT_HEADERS(),
        }
      );
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const assignments: IClassAssignment[] = await res.json();
      setClassAssignmentList(assignments);
      
    } catch (error) {
      console.error("Failed to fetch class assignments:", error);
    }
  };


  const handleClassChange = async (newClassId: string) => {
    setCurrClassId(newClassId);
  
    const selectedClass = classTitlesId.find(
      (classItem) => classItem.classId === newClassId
    );
    if (selectedClass) {
      setCurrClassTitle(selectedClass.title);
    }
  
    try {
      await fetchStudentsAndGrades(newClassId);
    } catch (error) {
      console.error("Failed to fetch students and their grades:", error);
    }
  };

    return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Grid container spacing={2} style={{ padding: "1rem" }}>
        <Grid xs={12} container alignItems="center" justifyContent="center">
          <Typography variant="h2" gutterBottom>
            Spark Assessment
          </Typography>
        </Grid>
        <Grid xs={12} md={4}>
          <Typography variant="h4" gutterBottom>
            Select a class
          </Typography>
          <div style={{ width: "100%" }}>
            <Select
              fullWidth={true}
              value={currClassId || ""}
              onChange={(e) => {
                handleClassChange(e.target.value);
              }}
            >
              {classTitlesId.map((classItem) => (
                <MenuItem key={classItem.classId} value={classItem.classId}>
                  {classItem.title}
                </MenuItem>
              ))}
            </Select>
          </div>
        </Grid>
        <Grid xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Final Grades
          </Typography>
          <div>
            <GradeTable studentGrades={grade} studentDetails={studentList} classTitleId={[currClassTitle,currClassId]} classAssignments={classAssignmentList}/>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
