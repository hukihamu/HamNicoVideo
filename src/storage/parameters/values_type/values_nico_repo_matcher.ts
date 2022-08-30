import {ValuesCheckBox} from '@/storage/parameters/values_type/values_check_box';
import {NicoRepoMatcherType} from '@/storage/parameters/nico_repo_matcher';

export interface ValuesNicoRepoMatcher extends ValuesCheckBox<keyof NicoRepoMatcherType>{
    template: {
        name: string
        matcher: string
    }
}