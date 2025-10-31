import { useNavigate, useNavigation } from "react-router";
import { CreatedDateFilterProvider, UpdatedDateFilterProvider } from '~/components/filter/date-filter-context';
import { SearchPage } from '~/components/search/search.page';
import { searchAll } from '~/service/document.search.server';
import type { Route } from './+types/z-editor.search';

export const loader = async ({ request }: Route.LoaderArgs) => searchAll(request);

const Search = ({ loaderData }: Route.ComponentProps) => {
  const navigate = useNavigate();
  const { state } = useNavigation();

  if (state === 'loading') {
    return (
      <div un-text="center" un-p="14">
        <span className="i-mdi:loading" un-animate='spin' un-text="5xl blue-500" aria-label="Loading documents" />
      </div>
    );
  }

  if ('error' in loaderData) {
    return <div un-text="center" un-p="14">
      <h1 un-text="red-500 lg">{loaderData.error}</h1>
      <button
        onClick={() => navigate(0)}
        un-grid='~' un-mx='auto' un-grid-flow='col' un-justify='center' un-items='center' un-gap='2' un-mt='4'
        un-p="1" un-px="4" un-bg="blue-500 hover:white" un-text="white hover:blue-500" un-rounded="md" un-cursor="pointer"
      >
        <span className="i-material-symbols-light:refresh" un-text='lg' />
        Retry
      </button>
    </div>;
  }

  return <CreatedDateFilterProvider>
    <UpdatedDateFilterProvider>
      <SearchPage {...loaderData} />;
    </UpdatedDateFilterProvider>
  </CreatedDateFilterProvider>;

};

export default Search;
