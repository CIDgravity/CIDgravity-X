import { makeStyles } from '@mui/styles'
import { Pagination } from '@mui/lab'

import scssVariables from '../../scss/cidg-variables.scss'

const useStyles = makeStyles(() => ({
    ul: {
        '& .MuiPaginationItem-root': {
            '&.Mui-selected': {
                background: scssVariables.blue,
                color: '#fff',
                borderRadius: '50%',
            },
        },
    },
}))

export function CustomPagination({
    currentPage,
    totalElements,
    itemPerPage,
    onPageChanged,
}) {
    const classes = useStyles()

    return (
        <div className="d-flex justify-content-center py-4">
            <Pagination
                classes={{
                    ul: classes.ul,
                }}
                defaultPage={currentPage}
                count={Math.ceil(totalElements / itemPerPage)}
                onChange={onPageChanged}
                boundaryCount={2}
            />
        </div>
    )
}
