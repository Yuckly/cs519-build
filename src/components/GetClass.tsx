
import { BASE_API_URL, GET_DEFAULT_HEADERS} from "../globals.js";

export const GetClass = () => {
    fetch(`${BASE_API_URL}/class/listBySemester/spring2023?buid=1`, {
        method: 'GET',
        headers: GET_DEFAULT_HEADERS()
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
      return (<div></div>);
}