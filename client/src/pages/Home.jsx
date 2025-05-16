import AOS from 'aos';
import 'aos/dist/aos.css';
import MyTimer from "../components/atoms/MyTimer";
import Navbar from "../components/organism/Navbar";
import ContactForm from "../components/organism/ContactSection";
import AboutUs from "../components/organism/AboutUs";
import ButtonComponent from "../components/atoms/ButtonComponent";
import EventCard from "../components/molecule/EventCard";
import { useSelector } from 'react-redux';
import PaginationRounded from '../components/molecule/PaginationRounded';
import { getAllEvents, getCountEvents } from '../api/endpoints/events';
import { useEffect, useState } from 'react';
import bg_image from "../assets/images/6a60863f-851e-4026-a8a5-218b429fe327.jpg"
import { toast } from 'react-toastify';
import { FiFilter } from 'react-icons/fi';
AOS.init();

export default function Home() {
  const authData = useSelector((state) => state.authData);
  const accessToken = authData?.accessToken;
  const [filter, setFilter] = useState('open');
  const [eventsData, setEventsData] = useState([]);
  const [eventsCount, setEventsCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchEventsCount = async () => {
      try {
        const eventsRes = await getCountEvents(filter);
        setEventsCount(eventsRes?.data?.count || 0);
        setPageCount(Math.ceil(eventsCount / itemsPerPage))
      } catch (error) {
        alert.error("Error fetching events count:", error);
      }
    };

    fetchEventsCount();
  }, [filter, eventsCount]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await allEventsData(currentPage, filter);
      } catch (error) {
        toast.error("Error fetching events data:", error);
      }
    };

    fetchEvents();
  }, [currentPage, filter]);

  const allEventsData = async (page, filter) => {
    try {
      const response = await getAllEvents(page, filter);
      setEventsData(response?.data || []);
    } catch (error) {
      toast.error("Error fetching events data:", error);
    }
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setCurrentPage(1);
  };

  const handlePagination = (event, value) => {
    setCurrentPage(value);
  };
  return (
    <div>
      <Navbar />
      <section
        id="home"
        className="relative bg-base-color w-full h-[100vh] "
        style={{
          backgroundImage: `url(${bg_image})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
        }}
      >
        <div className=" absolute w-full h-full bg-slate-900 bg-opacity-70"></div>
        <div className="first-section text-white flex flex-col justify-center items-center max-w-[1300px] mx-auto h-full pt-20">
          <h1
            data-aos="fade-right"
            data-aos-duration="2000"
            className="text-3xl xmobile:text-5xl 2xmobile:text-7xl md:text-8xl font-black z-10"
          >
            SWEET SPOT
          </h1>
          <h1
            data-aos="fade-left"
            data-aos-duration="2000"
            className="text-lg xmobile:text-xl 2xmobile:text-3xl md:text-5xl font-black z-10 mt-7"
          >
            Next Event
          </h1>
          <MyTimer />
          {!accessToken ? (
            <div
              data-aos="fade-up"
              data-aos-duration="2000"
              className="flex flex-col 2xmobile:flex-row gap-10 z-10 mt-20"
            >
              <ButtonComponent text={"Log In"} path={"/logIn"} />
              <ButtonComponent text={"Sign Up"} path={"/signUp"} />
            </div>
          ) : (
            <div
              data-aos="fade-up"
              data-aos-duration="2000"
              className="flex flex-col 2xmobile:flex-row gap-10 z-10 mt-20"
            >
              <ButtonComponent text={"My Tickets"} path={"/myTickets"} />
            </div>
          )}
        </div>
      </section>
      <AboutUs />

      <section
        id="events"
        className="relative bg-ticket-bg bg-no-repeat bg-cover bg-center w-full"
      >
        <div className="absolute w-full h-full bg-blue-600 bg-opacity-40"></div>
        <div className="max-w-[1300px] mx-auto flex flex-col justify-center items-center">
          <div className="z-10 mt-10 px-4 2xmobile:px-10">
            <div className="border-t-2 border-base-color border-opacity-60 w-44 my-10"></div>
            <h1 className="text-xl xmobile:text-2xl 2xmobile:text-4xl 2md:text-5xl text-gray-800 font-black z-10 text-center">
              Browse Through Our <span className="text-base-color">Events</span>{" "}
              Here.
            </h1>
          </div>
          <div className="z-10 mt-10">
            <label
              htmlFor="eventFilter"
              className="text-zinc-800 text-lg font-semibold flex items-center gap-2"
            >
              <FiFilter className="text-base-color text-xl" />
              Filter Events:
            </label>
            <select
              id="eventFilter"
              value={filter}
              onChange={handleFilterChange}
              className="bg-white/70 text-black border border-white/50 rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-my-color focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:scale-105"
            >
              <option value="all">All Events</option>
              <option value="open">Open Events</option>
              <option value="closed">Closed Events</option>
            </select>
          </div>
          <div className="mt-20 grid z-10 px-4 2xmobile:px-10 mb-20 gap-5">
            {eventsData.map((event) => (
              <EventCard
                key={event._id}
                id={event._id}
                image={event.coverImage}
                title={event.title}
                description={event.description}
                date={event.date}
                location={event.location}
                price={event.price}
                capacity={event.capacity}
                availableTickets={event.availableTickets}
                homeTickets={"Home"}
              />
            ))}
            {eventsData.length > 0 && (
              <div className="mx-auto mt-20">
                <PaginationRounded
                  count={pageCount}
                  page={currentPage}
                  onChange={handlePagination}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="second-section flex max-w-[1300px] mx-auto pt-14 pb-28 gap-6 p-4 overflow-hidden">
        <ContactForm />
      </div>
    </div>
  );
}
