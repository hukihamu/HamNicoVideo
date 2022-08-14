import {watchDetail} from '@/nico_client/watch_detail';
import {watchLater} from '@/nico_client/watch_later';
import {series} from '@/nico_client/series';

export const NicoAPI = {
    getWatchDetail: watchDetail.get,
    addWatchLater: watchLater.add,
    removeWatchLater: watchLater.remove,
    hasWatchLater: watchLater.has,
    getSeries: series.get
}