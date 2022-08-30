import {ValuesNicoRepoMatcher} from '@/storage/parameters/values_type/values_nico_repo_matcher';
import {NicoRepoMatcherType} from '@/storage/parameters/nico_repo_matcher';

export interface ValuesHighLight extends ValuesNicoRepoMatcher{
    config: {
        valueId: keyof NicoRepoMatcherType
        color: string
        enable: boolean
    }
}