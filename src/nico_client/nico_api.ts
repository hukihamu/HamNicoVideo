import {watchDetail} from '@/nico_client/watch_detail';
import {watchLater} from '@/nico_client/watch_later';
import {series} from '@/nico_client/series';
import {channels} from '@/nico_client/channels';
import {users} from '@/nico_client/users';
import {searchTag} from '@/nico_client/search_tag';

export const NicoAPI = {
    getWatchDetail: watchDetail.get,
    addWatchLater: watchLater.add,
    removeWatchLater: watchLater.remove,
    hasWatchLater: watchLater.has,
    getSeries: series.get,
    getChannelVideos: channels.get,
    getUserVideos: users.get,
    getSearchTagPage: searchTag.getPage
}