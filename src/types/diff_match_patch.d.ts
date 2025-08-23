declare namespace diff_match_patch {
    interface TranslatedDiff {
        0: number,
        1: number,
        2: number
        3: string
    }
    interface Diff {
        0: number,
        1: string
    }
    interface diff_match_patch {
        diff_main(original: string, modified: string) : Diff[]
    }
}
export = diff_match_patch