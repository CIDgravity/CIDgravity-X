import { useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'

/**
 * Custom withRouter HOC for react-router v7.
 * Provides backward-compatible history and match props so class components
 * wrapped with withRouter + withFormik etc. need minimal internal changes.
 */
export function withRouter(Component) {
    function WithRouter(props) {
        const navigate = useNavigate()
        const params = useParams()
        const location = useLocation()

        const history = useMemo(() => ({
            push: (path) => navigate(path),
            replace: (path) => navigate(path, { replace: true }),
            goBack: () => navigate(-1),
            go: (n) => navigate(n),
        }), [navigate])

        const match = useMemo(() => ({
            params,
        }), [params])

        return (
            <Component
                {...props}
                history={history}
                match={match}
                navigate={navigate}
                params={params}
                location={location}
            />
        )
    }

    WithRouter.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`
    return WithRouter
}
