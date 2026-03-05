import { Pagination } from '@mui/material'

import * as scssVariables from 'config/scss-variables'

export function CustomPagination({
    currentPage,
    totalElements,
    itemPerPage,
    onPageChanged,
}) {
    return (
        <div className="d-flex justify-content-center py-4">
            <Pagination
                sx={{
                    '& .MuiPaginationItem-root.Mui-selected': {
                        background: scssVariables.blue,
                        color: '#fff',
                        borderRadius: '50%',
                    },
                }}
                defaultPage={currentPage}
                count={Math.ceil(totalElements / itemPerPage)}
                onChange={onPageChanged}
                boundaryCount={2}
            />
        </div>
    )
}
