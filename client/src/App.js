import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Single from "./pages/Single";
import Home from "./pages/Home.jsx";
import YourPosts from "./pages/YourPosts";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile.jsx";
import GroupPosts from "./pages/GroupPosts";
import Sidebar from "./components/Sidebar";
import "./style.scss";
import ProfileSettings from "./pages/ProfileSettings";
import ManageGroups from "./pages/ManageGroups";
import ManageGroupPosts from "./pages/ManageGroupPosts";
import NoAccess from "./pages/NoAccess";
import CreateGroup from "./pages/CreateGroup";
import SocialMediaYourPosts from './pages/SocialMediaYourPosts';
import Feed from './pages/Feed.jsx';
import PostsManagement from "./components/PostsManagement";
import SocialMediaGroupPosts from "./pages/SocialMediaGroupPosts.jsx"

import { useContext } from "react";
import { AuthContext } from "./context/authContext";
import { ThemeProvider, useTheme } from "./context/themeContext.js";
import { LanguageProvider } from './context/languageContext.js';
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';

// import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Layout = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const { isDarkMode } = useTheme();

  
    // Redirect to login if there is no current user
    if(loading) {
      return <div> Loading... </div>
    }
    if (!currentUser) {

      console.log('not loggedin!!')
      window.location.href = '/login';
      return null;
    }

  return (
    <PrimeReactProvider>
    <div style={{ background: isDarkMode ? '#123' : '#d2f', color: isDarkMode ? '#fff' : '#333'}}>
      <Sidebar/>
    </div>
    <Navbar/>
    <div style={{ background: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#333'}}>
      <Outlet/>
    </div>
    {/* <Footer/> */}
    </PrimeReactProvider>
  )
}

const router = createBrowserRouter([
  {
    path: "/:workspace",
    element: <Layout/>,
    children: [
      {
        path:"feed",
        element:<Feed/>
      },
      {
        path:"feed/group/:group_name",
        element:<Feed/>
      },
      {
        path:"feed/your_posts",
        element:<Feed/>
      },
      {
        path:"post/:id",
        element:<Single/>
      },
      // {
      //   path:"write",
      //   element:<Write/>
      // },
      {
        path:"your_posts/:id",
        element:<YourPosts/>
      },
      {
        path:"profile_settings",
        element:<ProfileSettings/>
      },
      {
        path:"user/:username",
        element:<Profile/> //
      },
      {
        path:"group_posts/:group_name",
        element:<GroupPosts/>
      },
      {
        path:"manage_groups",
        element:<ManageGroups/>
      },
      {
        path:"no_access",
        element:<NoAccess/>
      },
      {
        path:"create_group",
        element:<CreateGroup/>
      },
      {
        path:"manage_group_posts/:group_name",
        element:<ManageGroupPosts/>
      },
      {
        path:"manage_group_posts",
        element:<ManageGroupPosts/>
      },
      {
        path:"social_media/your_posts/:state",
        element:<SocialMediaYourPosts/>
      },
      {
        path:"social_media/group_posts/:group_name",
        element:<SocialMediaGroupPosts/>
      }
    ]
  },
  {
    path:"",
    element:<Layout/>,
    children:[{
      path:"",
      element:<Home/>
    }]
  },
  {
    path: "/register",
    element: <Register/>,
  },
  {
    path: "/login",
    element: <Login/>,
  },
  
]);

function App() {
  return (
    <div className="app">
      <div className="container">
        <PrimeReactProvider>
          <LanguageProvider>
            <ThemeProvider>
              <RouterProvider router={router}/>
            </ThemeProvider>
          </LanguageProvider>
        </PrimeReactProvider>
      </div>
    </div>
  );
}



export default App;
